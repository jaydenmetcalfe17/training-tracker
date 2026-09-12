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

  const [loading, setLoading] =
    useState(false);


  const handleLogin = async (
    loginInfo: Login
  ) => {

    setLoginError(null);
    setLoading(true);

    try {

      const error =
        await newLogin(
          loginInfo,
          inviteToken || undefined
        );

      if (error) {
        setLoginError(error);
        setLoading(false);
      }

    } catch (error) {

      console.error(error);

      setLoginError(
        "An unexpected error occurred. Please try again."
      );

      setLoading(false);
    }
  };


  if (loading) {

    return (
      <div className="athlete-dashboard-wrapper">
        Loading...
      </div>
    );

  }


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