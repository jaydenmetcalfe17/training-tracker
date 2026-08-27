//context/AuthContext.tsx

import {
  createContext,
  useEffect,
  useState,
  type ReactNode
} from 'react';

import type { User } from '../types/User';
import { useNavigate } from 'react-router-dom';
import type { Login } from '../types/Login';


interface AuthContextType {
  user: User | null;
  newLogin: (
    loginInfo: Login,
    inviteToken?: string
  ) => Promise<string | null>;
  logout: () => void;
  isLoggedIn: () => boolean;
}


type Props = {
  children: ReactNode
};


const AuthContext =
  createContext<AuthContextType>(
    {} as AuthContextType
  );


export const AuthProvider =
  ({ children }: Props) => {

    const navigate =
      useNavigate();


    const [user, setUser] =
      useState<User | null>(null);


    const [isReady, setIsReady] =
      useState(false);


    // ----------------------------------------
    // Restore user from localStorage
    // ----------------------------------------

    useEffect(() => {

      const storedUser =
        localStorage.getItem("user");

      if (storedUser) {

        setUser(
          JSON.parse(storedUser)
        );
      }

      setIsReady(true);

    }, []);


    // ----------------------------------------
    // Login
    // ----------------------------------------

    const newLogin = async (
      loginInfo: Login,
      inviteToken?: string
    ): Promise<string | null> => {

      try {

        const res = await fetch(`/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(loginInfo),
        });

        const data = await res.json();

        // ----------------------------------------
        // Login failed
        // ----------------------------------------

        if (!res.ok || !data.success) {
          return data.message || "Login failed";
        }

        // ----------------------------------------
        // Store authenticated user
        // ----------------------------------------

        const userObj: User = {
          email: data.safeUser.email,
          userFirstName: data.safeUser.userFirstName,
          userLastName: data.safeUser.userLastName,
          userId: data.safeUser.userId,
          status: data.safeUser.status,
        };

        if (data.safeUser.athleteId != null) {
          userObj.athleteId =
            data.safeUser.athleteId;
        }

        localStorage.setItem(
          "user",
          JSON.stringify(userObj)
        );

        setUser(userObj);

        // ----------------------------------------
        // Invite login
        // ----------------------------------------

        if (inviteToken) {

          try {

            const inviteRes = await fetch(
              `/api/invite/${inviteToken}/accept`,
              {
                method: "POST",
                credentials: "include",
                headers: {
                  "Content-Type": "application/json"
                }
              }
            );

            const inviteData =
              await inviteRes.json();

            if (!inviteRes.ok) {

              return (
                inviteData.error ||
                "Unable to accept invitation."
              );
            }

            console.log(
              "Invite accepted:",
              inviteData
            );

          } catch (error) {

            console.error(
              "Error accepting invite:",
              error
            );

            return (
              "Your account was logged in, but the invitation could not be accepted."
            );
          }
        }

        // ----------------------------------------
        // Normal login / successful invite
        // ----------------------------------------

        navigate("/dashboard");

        return null;

      } catch (err) {

        console.error(
          "Failed to login",
          err
        );

        return (
          "Unable to connect to the server. Please try again."
        );
      }
    };


    // ----------------------------------------
    // Check login status
    // ----------------------------------------

    const isLoggedIn = () => {

      return !!user;
    };


    // ----------------------------------------
    // Logout
    // ----------------------------------------

    const logout = () => {

      localStorage.removeItem(
        "user"
      );

      setUser(null);

      navigate("/");
    };


    return (

      <AuthContext.Provider
        value={{
          user,
          newLogin,
          logout,
          isLoggedIn
        }}
      >

        {isReady
          ? children
          : null}

      </AuthContext.Provider>
    );
  };


export default AuthContext;