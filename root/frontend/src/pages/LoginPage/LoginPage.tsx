// pages/LoginPage.tsx

import LoginForm from '../../components/LoginForm/LoginForm';
import type { Login } from "../../types/Login";
import { useContext, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

import "./LoginPage.scss";


const LoginPage: React.FC = () => {

  const { newLogin } =
    useContext(AuthContext);

  const [searchParams] =
    useSearchParams();

  const inviteToken =
    searchParams.get("inviteToken");

  const [loginError, setLoginError] =
    useState<string | null>(null);


  const handleLogin = async (
    loginInfo: Login
  ) => {

    setLoginError(null);

    const error =
      await newLogin(
        loginInfo,
        inviteToken || undefined
      );

    if (error) {
      setLoginError(error);
    }
  };


  return (
    <div className="light-tan-box">

      <div className="white-box">

        <div className="login-page-box">

          {inviteToken ? (
            <h3 className="alt-colour-h3">
              Log in to accept your invitation
            </h3>
          ) : (
            <h3 className="alt-colour-h3">
              Follow link sent by coach to create an account
            </h3>
          )}

          <LoginForm
            onSubmit={handleLogin}
          />

          {loginError && (
            <div className="login-error">
              {loginError}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default LoginPage;