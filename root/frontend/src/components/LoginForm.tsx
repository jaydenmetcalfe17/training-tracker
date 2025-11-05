// components/LoginForm.tsx

import { useRef, useState } from 'react';
import type { Login } from '../types/Login';

interface LoginFormProps {
  onSubmit: (user: Login) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit }) => {
    const [formData, setFormData] = useState<Login>({
        email: '',
        password: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ email: '', password: ''});
  };

  const passwordRef = useRef<HTMLInputElement>(null);
    
  const revealPassword = () => {
    if (passwordRef.current) {
      const type = passwordRef.current.type === "password" ? "text" : "password";
      passwordRef.current.type = type;
    }
  }

  return (
    <form onSubmit={handleSubmit}>
        <input name="email" placeholder="Email" value={formData.email} onChange={handleChange}/>
        <input name="password" ref={passwordRef} type="password" placeholder="Password" value={formData.password} onChange={handleChange}/>
        <label>Show Password</label>
        <input type="checkbox" onClick={revealPassword}/>
        <button type="submit">Log In</button>
    </form>
  );

};

export default LoginForm
