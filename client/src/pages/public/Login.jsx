// client/src/pages/public/Login.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../../components/forms/LoginForm';
import { useAuth } from '../../hooks/useAuth';

const Login = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  useEffect(() => {
    // If a user is already logged in, redirect them away from the login page.
    if (currentUser) {
      const destination = currentUser.role === 'admin' ? '/admin/dashboard' : '/interviewer/dashboard';
      navigate(destination, { replace: true });
    }
  }, [currentUser, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10"></div>
      
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border border-slate-200 relative overflow-hidden">
        {/* Decorative gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-indigo-600/5 to-purple-600/5 -z-10"></div>
        
        {/* Header with gradient text */}
        <div className="text-center mb-8">

          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2">
            Welcome Back
          </h1>
          <p className="text-slate-600 font-medium">Sign in to your account</p>
        </div>
        
        <LoginForm />
        
      </div>
    </div>
  );
};

export default Login;