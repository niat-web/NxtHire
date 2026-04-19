import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Home, Mail, Linkedin } from 'lucide-react';

const ACCENT = '#FF4800';
const DISPLAY = { fontFamily: 'Fraunces, Georgia, serif' };

const ApplicationSuccess = () => {
  return (
    <div className="min-h-screen bg-white p-6 flex items-center justify-center">
      <div className="relative w-full max-w-md mx-auto">
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-full border border-slate-200 bg-white text-slate-900 mx-auto">
            <CheckCircle className="h-6 w-6" />
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 mt-6 text-[10.5px] font-semibold uppercase tracking-[0.2em] text-slate-600">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: ACCENT }} />
            Submitted
          </span>

          <h1 style={DISPLAY} className="mt-5 text-[32px] font-semibold text-slate-900 tracking-tight leading-tight">
            Application submitted.
          </h1>
          <p className="mt-3 text-[14px] text-slate-600 leading-relaxed">
            Thank you for applying to become a <span className="font-semibold text-slate-900">NxtWave Interviewer</span>.
          </p>

          <div className="mt-8 text-left">
            <p className="text-[10.5px] font-semibold text-slate-500 uppercase tracking-[0.2em] mb-4">What's next</p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center h-9 w-9 rounded-full border border-slate-200 bg-white flex-shrink-0 text-slate-700">
                  <Linkedin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-[13.5px]">Profile review</h4>
                  <p className="text-[12.5px] text-slate-600 mt-0.5">We'll review your profile within 2–3 business days.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center h-9 w-9 rounded-full border border-slate-200 bg-white flex-shrink-0 text-slate-700">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-[13.5px]">Get notified</h4>
                  <p className="text-[12.5px] text-slate-600 mt-0.5">We'll contact you via email or WhatsApp.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-2.5">
            <Link to="/" className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-full bg-slate-900 text-[13px] font-semibold text-white hover:bg-[#FF4800] transition-colors">
              <Home className="h-4 w-4" />
              Back to home
            </Link>
            <a
              href="https://mail.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-full border border-slate-900 text-[13px] font-semibold text-slate-900 hover:bg-slate-900 hover:text-white transition-colors"
            >
              <Mail className="h-4 w-4" />
              Check email
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationSuccess;
