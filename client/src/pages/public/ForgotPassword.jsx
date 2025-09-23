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

  const formInputBaseClasses = "block w-full pl-10 pr-4 py-3 border-2 placeholder-slate-400 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-50 text-sm font-medium transition-all duration-200 bg-slate-50/50 hover:bg-white focus:bg-white shadow-sm";
  const formInputNormalClasses = "border-slate-300 focus:border-indigo-500 focus:ring-indigo-500";
  const formInputErrorClasses = "border-red-300 focus:border-red-500 focus:ring-red-500";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Background grid pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10"></div>
      
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link to="/login" className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
            <FiArrowLeft className="mr-2 h-4 w-4" />
            Back to Login
          </Link>
        </div>
        
        {/* Main content card with enhanced styling */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-10 border border-slate-200/50 relative overflow-hidden">
          {/* Decorative gradient overlay inside the card */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-indigo-600/5 to-purple-600/5 -z-10"></div>
          
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
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-extrabold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                    Forgot Password?
                  </h1>
                  <p className="mt-2 text-slate-600">
                    Enter your email and we'll send you a reset link.
                  </p>
                </div>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder="Enter your email address"
                        className={`${formInputBaseClasses} ${errors.email ? formInputErrorClasses : formInputNormalClasses}`}
                        {...register('email', {
                          required: 'Email address is required.',
                          pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Please enter a valid email.' },
                        })}
                      />
                    </div>
                    {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>}
                  </div>

                  <div className="!mt-8">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                      <span className="absolute left-0 inset-y-0 flex items-center pl-4">
                          {isSubmitting ? (
                              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                          ) : (
                              <FiSend className="h-5 w-5 text-white/80 group-hover:text-white" />
                          )}
                      </span>
                      {isSubmitting ? 'Sending Link...' : 'Send Reset Link'}
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
