// components/CreateUserForm.tsx

import { useRef, useState } from 'react';
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
      password2: '',
      status: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    // input validation 
      let isValid = true;
      let errorMessage = "";

      if (e.target.name == "password") {
        const pattern = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-]).{8,24}$");
        if (!pattern.test(e.target.value)) { // if invalid input
          isValid = false;
          errorMessage = "Password must be between 8-24 characters, contain upper and lowercase letters, at least 1 number, and a special character: !@#$%^&*_=+-.";
        }
      } else if (e.target.name == "password2") {
          if (e.target.value !== formData.password) { // if invalid input
            isValid = false;
            errorMessage = "Passwords must match!"
        }
      } else if (e.target.name == "email") {
          if (e.target.matches(":invalid")) { // if invalid input
            isValid = false;
            errorMessage = "Please enter a valid email!"
        }
      // } else if (e.target.name == "team") {
      }
      setErrors((prev) => ({ ...prev, [e.target.name]: errorMessage }));

      if (isValid = true) {
        setFormData({ ...formData, [e.target.name]: e.target.value });
      } else {
        console.error("Invalid input. Please try again.");
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ userFirstName: '', userLastName: '', email: '', password: '', password2: '', status: '' });
  };

  const passwordRef = useRef<HTMLInputElement>(null);
  const password2Ref = useRef<HTMLInputElement>(null);
  
  const revealPassword = () => {
    if (passwordRef.current && password2Ref.current) {
      const type = passwordRef.current.type === "password" ? "text" : "password";
      passwordRef.current.type = type;
      password2Ref.current.type = type;
    }
  }

  return (
    <form onSubmit={handleSubmit}>
        <input name="userFirstName" type="text" placeholder="First Name" value={formData.userFirstName} onChange={handleChange}/>
        <input name="userLastName" type="text" placeholder="Last Name" value={formData.userLastName} onChange={handleChange}/>
        <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange}/>
        {errors.email && <p className="error-text">{errors.email}</p>}
        <input name="password" ref={passwordRef} type="password" placeholder="Password" value={formData.password} onChange={handleChange}/>
        {errors.password && <p className="error-text">{errors.password}</p>}
        <input name="password2" ref={password2Ref} type="password" placeholder="Re-enter Password" onChange={handleChange}/>  {/* need to check that passwords match! */}
        {errors.password2 && <p className="error-text">{errors.password2}</p>}
        <label>Show Password</label>
        <input type="checkbox" onClick={revealPassword}/>
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