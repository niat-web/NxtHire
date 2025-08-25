// client/src/pages/public/ApplicationFormPage.jsx
import React from 'react';
import InitialApplicationForm from '../../components/forms/InitialApplicationForm';

const ApplicationFormPage = () => {
  const handleSuccess = () => {
    // The form component handles navigation to the success page itself
  };

  return (
    <div className="min-h-screen bg-[#0B0C1E] text-gray-200 font-sans antialiased flex items-center justify-center py-1 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>

      <div className="w-full max-w-3xl bg-[#14162B]/60 backdrop-blur-lg rounded-2xl shadow-2xl p-8 sm:p-10 border border-white/10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl bg-gradient-to-r from-fuchsia-500 to-cyan-500 bg-clip-text text-transparent">
            Apply to Become a NxtWave Interviewer
          </h1>
        </div>
        
        <InitialApplicationForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
};

export default ApplicationFormPage;