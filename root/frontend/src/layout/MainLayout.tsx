import Navbar from "../components/Navbar"
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';


const MainLayout: React.FC = () => {
  const { user, logout } = useContext(AuthContext);

  return (
     <Navbar user={user} logout={logout} />
  )
}

export default MainLayout