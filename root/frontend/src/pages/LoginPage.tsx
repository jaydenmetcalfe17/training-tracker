// pages/LoginPage.tsx

import LoginForm from '../components/LoginForm';
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';


 ////validation!! use Yup? 


const LoginPage: React.FC = () => {
    const { newLogin } = useContext(AuthContext);  


  return (
    <div>
      <h1>Log In</h1>
      <LoginForm onSubmit={newLogin} />
      <Link to="/createUser">
        <button type="button">Create Account</button>
      </Link>
      {/* <Link to="/auth/google">
        <button type="button">Login with Google</button>
      </Link> */}
    </div>
  );
}

export default LoginPage