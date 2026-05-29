import React from 'react';
import InitialApplicationForm from '../../components/forms/InitialApplicationForm';

const InterviewerApplication = () => {
  const handleSuccess = () => {
    // The form component handles navigation to the success page itself.
  };

  return (
    <div className="min-h-screen bg-white antialiased flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl rounded-2xl border border-border bg-white p-8 sm:p-10">
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.2em] text-foreground/80">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: '#C0392B' }} />
            Apply
          </span>
          <h1 className="font-display mt-5 text-[32px] sm:text-[40px] font-semibold tracking-tight text-foreground leading-tight">
            Join our interviewer community.
          </h1>
        </div>

        <InitialApplicationForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
};

export default InterviewerApplication;
