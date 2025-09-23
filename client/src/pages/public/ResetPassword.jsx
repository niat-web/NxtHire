// client/src/pages/public/ResetPassword.jsx
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import ResetPasswordForm from '../../components/forms/ResetPasswordForm'; // <-- IMPORT a new, dedicated form component
import Alert from '../../components/common/Alert';
import Button from '../../components/common/Button';

const ResetPassword = () => {
  const location = useLocation();
  const token = new URLSearchParams(location.search).get('token');

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full">
          <Alert
            type="error"
            title="Invalid Link"
            message="The password reset link is invalid or has expired. Please request a new one."
            className="mb-6"
          />
          <div className="text-center">
            <Button
              to="/forgot-password"
              variant="primary"
            >
              Request New Link
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Background grid pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10"></div>
      
      {/* The main content card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 sm:p-10 border border-slate-200/50 relative overflow-hidden">
        {/* Decorative gradient overlay inside the card */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-indigo-600/5 to-purple-600/5 -z-10"></div>
        
        <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
              Reset Your Password
            </h1>
            <p className="mt-2 text-slate-600">
              Choose a new, secure password for your account.
            </p>
        </div>
        
        <ResetPasswordForm />
      </div>
    </div>
  );
};

export default ResetPassword;
