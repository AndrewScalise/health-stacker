// src/pages/auth/ForgotPasswordPage.jsx
import React from "react";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

const ForgotPasswordPage = () => {
  return (
    <>
      <h2 className="text-center text-2xl font-bold mb-6">Forgot Password</h2>
      <ForgotPasswordForm />
    </>
  );
};

export default ForgotPasswordPage;
