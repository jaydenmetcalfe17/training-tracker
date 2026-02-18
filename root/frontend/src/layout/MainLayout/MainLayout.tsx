// layout/MainLayout.tsx

import Header from "../../components/Header/Header"
import { useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import { Outlet } from "react-router-dom";
import "./MainLayout.scss";
// import Dashboard from "./Dashboard";


const MainLayout: React.FC = () => {
  const { user, logout } = useContext(AuthContext);
  const onLogin = location.pathname === "/login";

   const centerContent = location.pathname === "/login" || location.pathname.startsWith("/register");

  return (
    <div className={`main-app ${centerContent ? "centered-page" : ""}`}>
      {!onLogin && <Header user={user} logout={logout} />}
      <div className="app-content">
        <div className="page-wrapper">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MainLayout