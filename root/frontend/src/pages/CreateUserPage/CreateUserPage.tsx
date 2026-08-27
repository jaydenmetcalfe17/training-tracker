// pages/CreateUserPage.tsx

import { useState } from 'react';
import type { User } from '../../types/User';
import CreateUserForm from '../../components/CreateUserForm/CreateUserForm';
import { useNavigate, useParams } from 'react-router-dom';
import "./CreateUserPage.scss";

const CreateUserPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const { inviteToken } = useParams<{ inviteToken: string }>();
    const navigate = useNavigate();

    console.log("token: ", inviteToken);

    // Create User Profile
	  const createUser = (newUser: User) => {

      fetch(`/auth/registration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newUser,
          inviteToken
        }),
      })
        .then(async (res) => {

          const data = await res.json();

          if (!res.ok) {
            throw new Error(
              data.error ||
              "Failed to create user."
            );
          }

          return data;
        })
        .then((data) => {

          console.log(
            'User created:',
            data
          );

          setUsers([
            ...users,
            newUser
          ]);

          // After registration, send them
          // through login with the invite token.
          if (inviteToken) {

            navigate(
              `/login?inviteToken=${inviteToken}`
            );

          } else {

            navigate("/login");

          }
        })
        .catch((err) => {

          console.error(
            'Failed to create user',
            err
          );

        });
    };

  return (
    <div className="light-tan-box">
      <div className="white-box">
        <h1 className="create-account-text">Create Account</h1>
        <CreateUserForm onSubmit={createUser} inviteToken={inviteToken}/>
      </div>
    </div>
  );
}

export default CreateUserPage
