// components/LoginForm.tsx

import { useRef } from 'react';
import type { Login } from '../types/Login';

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
    <form onSubmit={handleSubmit}>
      <input ref={emailRef} name="email" placeholder="Email" />

      <input
        ref={passwordRef}
        type="password"
        name="password"
        placeholder="Password"
      />

      <label>Show Password</label>
      <input type="checkbox" onClick={revealPassword} />

      <button type="submit">Log In</button>
    </form>
  );
};

export default LoginForm;




// // components/LoginForm.tsx

// import { useRef, useState } from 'react';
// import type { Login } from '../types/Login';

// interface LoginFormProps {
//   onSubmit: (user: Login) => void;
// }

// const LoginForm: React.FC<LoginFormProps> = ({ onSubmit }) => {
//     const [formData, setFormData] = useState<Login>({
//         email: '',
//         password: '',
//     });

//     const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     onSubmit(formData);
//     setFormData({ email: '', password: ''});
//   };

//   const passwordRef = useRef<HTMLInputElement>(null);
    
//   const revealPassword = () => {
//     if (passwordRef.current) {
//       const type = passwordRef.current.type === "password" ? "text" : "password";
//       passwordRef.current.type = type;
//     }
//   }

//   return (
//     <form onSubmit={handleSubmit}>
//         <input name="email" placeholder="Email" value={formData.email} onChange={handleChange}/>
//         <input name="password" ref={passwordRef} type="password" placeholder="Password" value={formData.password} onChange={handleChange}/>
//         <label>Show Password</label>
//         <input type="checkbox" onClick={revealPassword}/>
//         <button type="submit">Log In</button>
//     </form>
//   );

// };

// export default LoginForm
