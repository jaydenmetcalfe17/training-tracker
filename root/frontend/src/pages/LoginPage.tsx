// pages/LoginPage.tsx

import type { Login } from '../types/Login';
import LoginForm from '../components/LoginForm';
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);  

	  const newLogin = (newLogin: Login) => {
        
        fetch('/auth/login', {
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
          console.log('Login complete:', data);
          login(data.safeUser);
          navigate('/dashboard');
        }
      })
      .catch((err) => console.error('Failed to login', err));
  };

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