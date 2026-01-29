import { createContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '../types/User';
import { useNavigate } from 'react-router-dom';
import type { Login } from '../types/Login';


interface AuthContextType {
  user: User | null;
  // token: string | null;
  // register: (loginInfo: Login) => void;
  newLogin: (loginInfo: Login) => void;
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
  const newLogin = async (newLogin: Login) => {
        
        await fetch('/auth/login', {
		// fetch('http://localhost:3000/auth/login', {    // for when the vite.config.ts file is not redirecting to localhost:3000
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(newLogin),
		  })
		  .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          console.log(data.safeUser);
          const userObj: User = {
            email: data.safeUser.email,
            userFirstName: data.safeUser.userFirstName,
            userLastName: data.safeUser.userLastName,
            userId: data.safeUser.userId,
            status: data.safeUser.status,
          }
          localStorage.setItem("user", JSON.stringify(userObj));
          // localStorage.setItem("token", data.token);
          // setToken(data.token);
          setUser(userObj);
          console.log('Login complete:', data);
          navigate('/dashboard');
        }
      })
      .catch((err) => console.error('Failed to login', err));
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


