// client/src/pages/public/ResetPassword.jsx
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ResetPasswordForm from '../../components/forms/ResetPasswordForm';

const ResetPassword = () => {
  const location = useLocation();
  const token = new URLSearchParams(location.search).get('token');

  // --- Invalid Token View ---
  if (!token) {
    return (
      <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-gray-100 p-8 text-center">
          <div className="mx-auto w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-4 border border-red-100">
            <AlertTriangle className="h-7 w-7 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid Link</h2>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            The password reset link is missing, invalid, or has expired. Please request a new link to proceed.
          </p>
          <Button asChild className="w-full" size="lg">
            <Link to="/forgot-password">
              Request New Link
            </Link>
          </Button>
          <div className="mt-4">
             <Link to="/login" className="text-sm font-semibold text-gray-600 hover:text-gray-900">Back to Login</Link>
          </div>
        </div>
      </div>
    );
  }

  // --- Main Form View ---
  return (
    <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center p-4 relative">

      {/* Back Link */}
      <div className="absolute top-6 left-6 md:top-10 md:left-10 z-10">
        <Link
          to="/login"
          className="inline-flex items-center text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors group"
        >
          <div className="p-1.5 rounded-lg bg-white border border-gray-200 shadow-sm group-hover:border-gray-300 mr-2 transition-all">
             <ArrowLeft className="h-4 w-4" />
          </div>
          Back to Login
        </Link>
      </div>

      <div className="w-full max-w-[440px]">
        <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-8 sm:p-10">
            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                    Reset Password
                </h1>
                <p className="text-gray-500 text-sm">
                    Please choose a strong password for your account.
                </p>
            </div>

            <ResetPasswordForm token={token} />
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
