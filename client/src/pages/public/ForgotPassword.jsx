// client/src/pages/public/ForgotPassword.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FiArrowLeft, FiSend, FiMail, FiCheckCircle, FiLoader } from 'react-icons/fi';
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
    if (!data.email) return;
    
    setIsSubmitting(true);
    try {
      await forgotPassword(data.email);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error requesting password reset:', error);
      showError(error.response?.data?.message || 'Failed to send reset link. Please verify the email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F5F7F9] flex items-center justify-center p-4 relative">
      
      {/* Back to Login Link */}
      <div className="absolute top-6 left-6 md:top-10 md:left-10 z-10">
        <Link 
          to="/login" 
          className="inline-flex items-center text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors group"
        >
          <div className="p-1.5 rounded-lg bg-white border border-gray-200 shadow-sm group-hover:border-gray-300 mr-2 transition-all">
             <FiArrowLeft className="h-4 w-4" />
          </div>
          Back to Login
        </Link>
      </div>
      
      <div className="w-full max-w-[440px]">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-10">
          <AnimatePresence mode="wait">
            {isSubmitted ? (
              // --- Success State ---
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <div className="mx-auto w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-6 border border-green-100">
                  <FiCheckCircle className="h-8 w-8 text-green-600" />
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
                <p className="text-gray-500 mb-8 leading-relaxed text-sm">
                  We've sent a password reset link to your email address. Please follow the link to create a new password.
                </p>

                <a
                  href="https://mail.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg text-sm font-bold text-white bg-gray-900 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 shadow-sm transition-all duration-200"
                >
                    <FiMail className="mr-2 h-4 w-4" />
                    Open Email App
                </a>
                
                <p className="mt-6 text-xs text-gray-400">
                  Didn't receive the email? <button onClick={() => setIsSubmitted(false)} className="text-gray-900 font-semibold hover:underline">Click to retry</button>
                </p>
              </motion.div>
            ) : (
              // --- Form State ---
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Forgot password?
                    </h1>
                    <p className="text-gray-500 text-sm">
                        No worries, we'll send you reset instructions.
                    </p>
                </div>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiMail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder="Enter your email"
                        className={`block w-full pl-10 pr-3 py-2.5 bg-white border ${
                            errors.email 
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                              : 'border-gray-300 focus:ring-gray-900 focus:border-gray-900'
                          } text-gray-900 text-sm rounded-lg focus:outline-none focus:ring-1 transition-colors shadow-sm`}
                        {...register('email', {
                          required: 'Email address is required.',
                          pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Please enter a valid email.' },
                        })}
                      />
                    </div>
                    {errors.email && (
                        <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center">
                            {errors.email.message}
                        </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg text-sm font-bold text-white bg-gray-900 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 shadow-sm transition-all duration-200 ${
                        isSubmitting ? 'opacity-70 cursor-not-allowed' : 'active:scale-[0.98]'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <FiLoader className="animate-spin h-5 w-5 mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <FiSend className="h-4 w-4 mr-2" />
                        Send Reset Link
                      </>
                    )}
                  </button>
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
