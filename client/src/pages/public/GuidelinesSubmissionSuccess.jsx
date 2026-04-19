import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Home } from 'lucide-react';

const ACCENT = '#FF4800';
const DISPLAY = { fontFamily: 'Fraunces, Georgia, serif' };

const GuidelinesSubmissionSuccess = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 p-10 text-center">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-full border border-slate-200 bg-white text-slate-900 mx-auto">
          <CheckCircle className="h-6 w-6" />
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 mt-6 text-[10.5px] font-semibold uppercase tracking-[0.2em] text-slate-600">
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: ACCENT }} />
          Complete
        </span>

        <h1 style={DISPLAY} className="mt-5 text-[32px] font-semibold text-slate-900 tracking-tight leading-tight">
          Submission complete.
        </h1>
        <p className="mt-3 text-[14px] text-slate-600 leading-relaxed">
          Thank you for completing the interviewer guidelines assessment.
        </p>

        <div className="my-8 text-left bg-slate-50 p-6 rounded-2xl border border-slate-200">
          <p className="text-[10.5px] font-semibold text-slate-500 uppercase tracking-[0.2em] mb-3">What's next</p>
          <ol className="list-decimal list-inside space-y-3 text-slate-700 text-[13.5px] leading-relaxed">
            <li>
              <span className="font-semibold text-slate-900">Under review —</span> Our team will now review your assessment results. This typically takes 1–2 business days.
            </li>
            <li>
              <span className="font-semibold text-slate-900">Notification —</span> You will receive an email with the final decision and next steps. Please keep an eye on your inbox.
            </li>
          </ol>
        </div>

        <Link to="/" className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-full bg-slate-900 text-[13px] font-semibold text-white hover:bg-[#FF4800] transition-colors">
          <Home className="h-4 w-4" />
          Back to home
        </Link>
      </div>
    </div>
  );
};

export default GuidelinesSubmissionSuccess;
