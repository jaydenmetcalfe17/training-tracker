// components/CreateUserForm.tsx

import { useState } from 'react';
import type { User } from '../types/User';

interface UserFormProps {
  onSubmit: (user: User) => void;
}

const CreateUserForm: React.FC<UserFormProps> = ({ onSubmit }) => {
    const [formData, setFormData] = useState<User>({
        userFirstName: '',
        userLastName: '',
        email: '',
        password: '',
        status: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ userFirstName: '', userLastName: '', email: '', password: '', status: '' });
  };

  return (
    <form onSubmit={handleSubmit}>
        <input name="userFirstName" placeholder="First Name" value={formData.userFirstName} onChange={handleChange}/>
        <input name="userLastName" placeholder="Last Name" value={formData.userLastName} onChange={handleChange}/>
        <input name="email" placeholder="Email" value={formData.email} onChange={handleChange}/>
        <input name="password" placeholder="Password" value={formData.password} onChange={handleChange}/>
        <select name="status" value={formData.status} onChange={handleChange}>
          <option value="" disabled>Select your status: </option>
          <option value="coach">Coach</option>
          <option value="athlete">Athlete</option>
          <option value="parent">Parent</option>
        </select>
         <button type="submit">Create Account</button>
    </form>
  );

};



export default CreateUserForm