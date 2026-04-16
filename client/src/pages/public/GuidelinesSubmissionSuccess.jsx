// client/src/pages/public/GuidelinesSubmissionSuccess.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

const GuidelinesSubmissionSuccess = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-slate-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Background grid pattern for a subtle texture */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10"></div>

      {/* Main content card */}
      <div className="w-full max-w-lg bg-white rounded-xl shadow-xl p-8 sm:p-10 border border-slate-200/50 relative overflow-hidden">
        {/* Decorative gradient overlay inside the card */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-blue-600/5 to-blue-600/5 -z-10"></div>

        {/* Content */}
        <div className="text-center">

          <div className="inline-flex items-center justify-center p-3 bg-green-100 rounded-full mb-6 ring-8 ring-green-50">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>

          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-slate-800 to-green-700 bg-clip-text text-transparent">
            Submission Complete!
          </h1>
          <p className="mt-2 text-slate-600">
            Thank you for completing the interviewer guidelines assessment.
          </p>

          <div className="my-8 text-left bg-slate-50/70 p-6 rounded-xl border border-slate-200 space-y-4">
              <h3 className="font-semibold text-lg text-slate-800">What's Next?</h3>
              <ol className="list-decimal list-inside space-y-3 text-slate-600">
                  <li>
                      <span className="font-medium">Under Review:</span> Our team will now review your assessment results. This typically takes 1-2 business days.
                  </li>
                  <li>
                      <span className="font-medium">Notification:</span> You will receive an email with the final decision and the next steps. Please keep an eye on your inbox.
                  </li>
              </ol>
          </div>

          <Button asChild variant="success" size="lg" className="rounded-xl px-8 shadow-md font-semibold">
            <Link to="/">
              <Home className="mr-2 h-5 w-5"/>
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GuidelinesSubmissionSuccess;
