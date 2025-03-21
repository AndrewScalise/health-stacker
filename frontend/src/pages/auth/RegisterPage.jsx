// src/pages/auth/RegisterPage.jsx
import React from "react";
import RegisterForm from "@/components/auth/RegisterForm";

const RegisterPage = () => {
  return (
    <>
      <h2 className="text-center text-2xl font-bold mb-6">
        Create your account
      </h2>
      <RegisterForm />
    </>
  );
};

export default RegisterPage;
