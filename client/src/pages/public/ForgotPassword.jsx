// client/src/pages/public/ForgotPassword.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FiArrowLeft, FiSend, FiMail, FiCheckCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { forgotPassword } from '../../api/auth.api';
import { useAlert } from '../../hooks/useAlert';

const ForgotPassword = () => {
  const { showError } = useAlert();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm();

  const onSubmit = async (data) => {
    if (!data.email) {
      showError('Please enter your email address.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await forgotPassword(data.email);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error requesting password reset:', error);
      showError(error.response?.data?.message || 'Failed to send reset link. Please verify the email and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-100/20 via-white to-indigo-100/20 p-4 sm:p-8 flex items-center justify-center relative">
      
      {/* Back to Login link positioned at the top-left of the entire page */}
      <Link 
        to="/login" 
        className="absolute top-6 left-6 sm:top-8 sm:left-8 inline-flex items-center text-sm font-semibold text-blue-700 hover:text-blue-900 transition-colors z-10"
      >
        <FiArrowLeft className="mr-2 h-4 w-4" />
        Back to Login
      </Link>
      
      <div className="w-full max-w-md">
        {/* Main content card with updated UI */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 sm:p-10 border border-slate-200/80">
          <AnimatePresence mode="wait">
            {isSubmitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center p-3 bg-green-100 rounded-full mb-6 ring-8 ring-green-50">
                  <FiCheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-800">Check Your Inbox</h1>
                <p className="mt-2 text-slate-600">
                  If an account exists with that email, we've sent instructions to reset your password.
                </p>
                <div className="mt-8">
                  <a
                    href="https://mail.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
                  >
                      <FiMail className="mr-2 h-5 w-5" />
                      Open Email
                  </a>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-left mb-8">
                    <h1 className="text-3xl font-bold text-slate-800">
                        Forgot Password?
                    </h1>
                    <p className="mt-2 text-slate-500">
                        Enter your email and we'll send you a reset link.
                    </p>
                </div>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder="Enter your email address"
                        className={`block w-full pl-11 pr-4 py-3 border rounded-lg shadow-sm text-sm focus:outline-none transition-colors ${errors.email ? 'border-red-300 ring-red-500 focus:ring-1 focus:border-red-500' : 'border-slate-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500'}`}
                        {...register('email', {
                          required: 'Email address is required.',
                          pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Please enter a valid email.' },
                        })}
                      />
                    </div>
                    {errors.email && <p className="mt-2 text-xs text-red-600">{errors.email.message}</p>}
                  </div>

                  <div className="!mt-8">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="group w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg hover:shadow-indigo-500/30 transition-shadow disabled:opacity-75"
                    >
                      <span className="flex items-center">
                        {isSubmitting ? (
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <FiSend className="h-5 w-5 mr-2" />
                        )}
                        <span>{isSubmitting ? 'Sending Link...' : 'Send Reset Link'}</span>
                      </span>
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
