// pages/CreateUserPage.tsx

import { useState } from 'react';
import type { User } from '../types/User';
import CreateUserForm from '../components/CreateUserForm';

const CreateUserPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);

    // Create User Profile
	  const createUser = (newUser: User) => {
        
        fetch('/auth/registration', {
		// fetch('http://localhost:3000/auth/registration', {    // for when the vite.config.ts file is not redirecting to localhost:3000
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(newUser),
		  })
		  .then((res) => res.json())
      .then((data) => {
          console.log('User created:', data);
          setUsers([...users, newUser]);
      })
      .catch((err) => console.error('Failed to create user', err));
  };

  return (
    <div>
      <h1>Create Account</h1>
      <CreateUserForm onSubmit={createUser} />
    </div>
  );
}

export default CreateUserPage
