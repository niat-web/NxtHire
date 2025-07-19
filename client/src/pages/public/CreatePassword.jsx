// client/src/pages/public/CreatePassword.jsx
import React from 'react';
import CreatePasswordForm from '../../components/forms/CreatePasswordForm';

const CreatePassword = () => {
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
              Set Your Password
            </h1>
            <p className="mt-2 text-slate-600">
              Welcome aboard! Create a secure password to access your interviewer dashboard.
            </p>
        </div>
        
        <CreatePasswordForm />
      </div>
    </div>
  );
};

export default CreatePassword;