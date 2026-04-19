import React from 'react';
import CreatePasswordForm from '../../components/forms/CreatePasswordForm';

const CreatePassword = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 sm:p-10">
        <div className="text-center mb-8">
          <h1 className="font-display text-[32px] font-semibold text-slate-900 tracking-tight leading-tight">
            Set your password.
          </h1>
          <p className="mt-2 text-[13.5px] text-slate-600 leading-relaxed">
            Welcome aboard. Create a secure password to access your interviewer dashboard.
          </p>
        </div>

        <CreatePasswordForm />
      </div>
    </div>
  );
};

export default CreatePassword;
