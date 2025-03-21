// src/pages/auth/ResetPasswordPage.jsx
import React from "react";
import { useParams } from "react-router-dom";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

const ResetPasswordPage = () => {
  const { token } = useParams();

  return (
    <>
      <h2 className="text-center text-2xl font-bold mb-6">Reset Password</h2>
      <ResetPasswordForm token={token} />
    </>
  );
};

export default ResetPasswordPage;
