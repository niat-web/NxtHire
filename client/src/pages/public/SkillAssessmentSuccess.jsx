import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Home, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SkillAssessmentSuccess = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-emerald-50 flex items-center justify-center p-4">
      {/* Subtle background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-emerald-200/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-indigo-200/10 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-green-200/10 rounded-full blur-xl"></div>
      </div>

      <div className="relative w-full max-w-md mx-auto">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6">
          {/* Success Icon */}
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center relative">
              <div className="bg-gradient-to-r from-green-500 to-indigo-500 p-3 rounded-full shadow-md">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 text-yellow-400">
                <Sparkles className="h-3 w-3" />
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-4">
            <h1 className="text-2xl font-semibold mb-2 bg-gradient-to-r from-slate-800 to-indigo-700 bg-clip-text text-transparent">
              Thank You!
            </h1>
          </div>

          {/* Content */}
          <div className="space-y-4 mb-6">
            <div className="bg-gradient-to-r from-slate-50 to-emerald-50 rounded-xl p-4 border border-slate-200/50">
              <p className="text-slate-700 text-sm leading-relaxed">
                Thank you for completing the registration form and expressing your interest in becoming an
                <span className="font-semibold text-indigo-700 mx-1">interviewer with NxtWave</span>.
                Your expertise is valuable to us.
              </p>
            </div>

            <div className="bg-gradient-to-r from-emerald-50 to-emerald-50 rounded-xl p-4 border border-emerald-200/50">
              <p className="text-slate-700 text-sm leading-relaxed">
                Our team will review your complete profile and get back to you with the next steps.
                Please keep an eye on your email.
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <Button asChild variant="success" className="rounded-xl px-6 h-12 shadow-md font-semibold">
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>

          {/* Decorative dots */}
          <div className="flex justify-center gap-1 mt-4">
            <div className="w-1.5 h-1.5 bg-emerald-300 rounded-full animate-pulse"></div>
            <div className="w-1.5 h-1.5 bg-indigo-300 rounded-full animate-pulse delay-200"></div>
            <div className="w-1.5 h-1.5 bg-purple-300 rounded-full animate-pulse delay-400"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillAssessmentSuccess;
