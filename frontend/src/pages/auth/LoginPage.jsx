// src/pages/auth/LoginPage.jsx
import React from "react";
import LoginForm from "@/components/auth/LoginForm";

const LoginPage = () => {
  return (
    <>
      <h2 className="text-center text-2xl font-bold mb-6">
        Sign in to your account
      </h2>
      <LoginForm />
    </>
  );
};

export default LoginPage;
