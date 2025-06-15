// pages/LoginPage.tsx

import { useState } from 'react';
import type { Login } from '../types/Login';
import LoginForm from '../components/LoginForm';
import { Link } from 'react-router-dom';

const LoginPage: React.FC = () => {
    const [logins, setLogins] = useState<Login[]>([]);

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
          setLogins([...logins, newLogin]);
          window.location.href = '/';
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
    </div>
  );
}

export default LoginPage