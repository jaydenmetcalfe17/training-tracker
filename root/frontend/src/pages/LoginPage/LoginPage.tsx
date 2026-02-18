// pages/LoginPage.tsx

import LoginForm from '../../components/LoginForm/LoginForm';
// import { Link } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../../context/AuthContext';

import "./LoginPage.scss";


 ////validation!! use Yup? 


const LoginPage: React.FC = () => {
    const { newLogin } = useContext(AuthContext);  


  return (
    <div className="light-tan-box">
      <div className="white-box">
        <div className="login-page-box">
          {/* <h1>Log In</h1> */}
          <h3 className="alt-colour-h3">Follow link emailed by coach to create an account</h3>
          <LoginForm onSubmit={newLogin} />
          {/* <Link to="/register">
            <button type="button">Create Account</button>
          </Link> */}
          {/* <Link to="/auth/google">
            <button type="button">Login with Google</button>
          </Link> */}
        </div>
      </div>
    </div>
  );
}

export default LoginPage