import { createContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '../types/User';
import { useNavigate } from 'react-router-dom';
import type { Login } from '../types/Login';


interface AuthContextType {
  user: User | null;
  // token: string | null;
  // register: (loginInfo: Login) => void;
  newLogin: (loginInfo: Login) => Promise<string | null>;
  logout: () => void;
  isLoggedIn: () => boolean;
};

type Props = {children: ReactNode};


const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: Props) => {
  const navigate = useNavigate();
  // const [token, setToken] = useState<string | null>(null); 
  const [user, setUser] = useState<User | null>(null); 
  const [isReady, setIsReady] = useState(false); 


  useEffect(() => {
  const user = localStorage.getItem("user");

  if (user) {
    setUser(JSON.parse(user));
  }

  setIsReady(true);
}, []);

  //No feature for auto-login after user registration yet
  const newLogin = async (
    loginInfo: Login
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
      // Login successful
      // ----------------------------------------

      console.log(
        "LOGGED SAFEUSER: ",
        data.safeUser
      );

      const userObj: User = {
        email: data.safeUser.email,
        userFirstName:
          data.safeUser.userFirstName,
        userLastName:
          data.safeUser.userLastName,
        userId: data.safeUser.userId,
        status: data.safeUser.status,
      };

      if (
        data.safeUser.athleteId != null
      ) {
        userObj.athleteId =
          data.safeUser.athleteId;

        console.log(
          "Athlete id exists and is: ",
          userObj.athleteId
        );
      }

      localStorage.setItem(
        "user",
        JSON.stringify(userObj)
      );

      setUser(userObj);

      console.log(
        "Login complete:",
        data
      );

      navigate("/dashboard");

      return null;

    } catch (err) {

      console.error(
        "Failed to login",
        err
      );

      return "Unable to connect to the server. Please try again.";
    }
  };

  const isLoggedIn = () => {
    return !!user;
  }

  const logout = () => {
    localStorage.removeItem("user");
    // localStorage.removeItem("token");
    // setToken("");
    setUser(null);
    navigate("/");
  }

  return (
     <AuthContext.Provider value={{ user, newLogin, logout, isLoggedIn }}> {/* // token if necessary */}
       {isReady ? children : null }
     </AuthContext.Provider>
  );
};

export default AuthContext; 


