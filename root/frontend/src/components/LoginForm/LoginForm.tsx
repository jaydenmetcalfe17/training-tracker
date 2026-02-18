// components/LoginForm.tsx

import { useRef } from 'react';
import type { Login } from '../../types/Login';
import "./LoginForm.scss";

interface LoginFormProps {
  onSubmit: (user: Login) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit }) => {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const email = emailRef.current?.value || "";
    const password = passwordRef.current?.value || "";

    onSubmit({ email, password });

    // clear inputs manually
    if (emailRef.current) emailRef.current.value = "";
    if (passwordRef.current) passwordRef.current.value = "";
  };

  const revealPassword = () => {
    if (passwordRef.current) {
      passwordRef.current.type =
        passwordRef.current.type === "password" ? "text" : "password";
    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <input ref={emailRef} name="email" placeholder="Email" />

      <input
        ref={passwordRef}
        type="password"
        name="password"
        placeholder="Password"
      />
      <div className="show-password-box">
        <label>Show Password</label>
        <input type="checkbox" onClick={revealPassword} />
      </div>

      <button className="main-button" id="login-button" type="submit">Log In</button>
    </form>
  );
};

export default LoginForm;



