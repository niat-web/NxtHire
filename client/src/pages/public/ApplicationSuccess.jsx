import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Home, Mail, Linkedin, Copy, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ApplicationSuccess = () => {
  const { id } = useParams();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-emerald-50 to-slate-50 p-6 flex items-center justify-center">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-32 h-32 bg-emerald-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-emerald-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-emerald-200/20 rounded-full blur-2xl"></div>
      </div>

      <div className="relative w-full max-w-md mx-auto">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/50">
          {/* Success Icon */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center relative">
              <div className="bg-gradient-to-r from-green-500 to-indigo-500 p-4 rounded-full shadow-md">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 text-yellow-400">
                <Sparkles className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-semibold mb-2 bg-gradient-to-r from-slate-800 to-indigo-700 bg-clip-text text-transparent">
              Application Submitted!
            </h1>
            <p className="text-slate-600 text-sm">
              Thank you for applying to become a{' '}
              <span className="font-semibold text-indigo-600">NxtWave Interviewer</span>
            </p>
          </div>

          {/* What's Next */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 text-center">What's Next?</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 rounded-full flex-shrink-0">
                  <Linkedin className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm">Profile Review</h4>
                  <p className="text-xs text-slate-600">We'll review your profile within 2-3 business day</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full flex-shrink-0">
                  <Mail className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm">Get Notified</h4>
                  <p className="text-xs text-slate-600">We'll contact you via email or WhatsApp</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button asChild variant="success" className="w-full rounded-xl h-12 shadow-md font-semibold">
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full rounded-xl h-12 font-semibold">
              <a
                href="https://mail.google.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Mail className="h-4 w-4 mr-2" />
                Check Email
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationSuccess;
