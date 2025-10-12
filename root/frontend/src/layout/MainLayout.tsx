import Header from "../components/Header/Header"
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { Outlet } from "react-router-dom";
// import Dashboard from "./Dashboard";


const MainLayout: React.FC = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <>
      <Header user={user} logout={logout} />
      <Outlet />
    </>
  )
}

export default MainLayout