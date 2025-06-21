import { createContext, useState, type ReactNode } from 'react';
import type { User } from '../types/User';


interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
});


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (userData: User) => {
    console.log("Received userData in login:", userData);
    setUser(userData);
    console.log("User set: ", userData);
  };

  const logout = () => {
    setUser(null);
    console.log("User is logged out!");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 