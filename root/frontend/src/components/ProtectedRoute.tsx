// components/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../context/AuthContext";

interface Props {
  children: React.JSX.Element;
  redirectTo?: string;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<Props> = ({ children, redirectTo = "/login", allowedRoles = [] }) => {
  const { isLoggedIn, user } = useContext(AuthContext);

  if (!isLoggedIn()) {
    return <Navigate to={redirectTo} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.status ?? "")) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
