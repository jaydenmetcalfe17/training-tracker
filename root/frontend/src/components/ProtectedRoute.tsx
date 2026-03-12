// components/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../context/AuthContext";

interface Props {
  children: React.JSX.Element;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<Props> = ({ children, redirectTo = "/login" }) => {
  const { isLoggedIn } = useContext(AuthContext);
  return isLoggedIn() ? children : <Navigate to={redirectTo} replace />;
};

export default ProtectedRoute;
