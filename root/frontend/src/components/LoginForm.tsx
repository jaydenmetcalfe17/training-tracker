// components/LoginForm.tsx

import { useState } from 'react';
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

  return (
    <form onSubmit={handleSubmit}>
        <input name="email" placeholder="Email" value={formData.email} onChange={handleChange}/>
        <input name="password" placeholder="Password" value={formData.password} onChange={handleChange}/>
        <button type="submit">Log In</button>
    </form>
  );

};

export default LoginForm
