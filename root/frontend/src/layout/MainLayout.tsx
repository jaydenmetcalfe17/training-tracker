import Header from "../components/Header"
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';
// import Dashboard from "./Dashboard";


const MainLayout: React.FC = () => {
  const { user, logout } = useContext(AuthContext);

  return (
     <>
      <Header user={user} logout={logout} />
    </>
  )
}

export default MainLayout