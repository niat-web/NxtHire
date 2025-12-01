// client/src/components/forms/LoginForm.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import { useAlert } from '../../hooks/useAlert';
import { FiEye, FiEyeOff, FiMail, FiLock, FiLoader, FiLogIn } from 'react-icons/fi';

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showError } = useAlert();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const user = await login(data.email, data.password);
      
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/interviewer/dashboard');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Invalid credentials. Please try again.';
      showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      {/* Email Field */}
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
            {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Please enter a valid email address'
                }
            })}
            placeholder="name@company.com"
            className={`block w-full pl-10 pr-3 py-2.5 bg-white border ${
              errors.email 
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:ring-gray-900 focus:border-gray-900'
            } text-gray-900 text-sm rounded-lg focus:outline-none focus:ring-1 transition-colors shadow-sm`}
          />
        </div>
        {errors.email && (
          <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center">
            {errors.email.message}
          </p>
        )}
      </div>
      
      {/* Password Field */}
      <div>
        <label htmlFor="password" className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
          Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiLock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            {...register('password', { 
                required: 'Password is required'
            })}
            placeholder="••••••••"
            className={`block w-full pl-10 pr-10 py-2.5 bg-white border ${
              errors.password 
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:ring-gray-900 focus:border-gray-900'
            } text-gray-900 text-sm rounded-lg focus:outline-none focus:ring-1 transition-colors shadow-sm`}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FiEyeOff className="h-5 w-5"/> : <FiEye className="h-5 w-5"/>}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center">
            {errors.password.message}
          </p>
        )}
      </div>
      
      {/* Links */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember_me"
            type="checkbox"
            className="h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded cursor-pointer"
          />
          <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-600 cursor-pointer select-none">
            Remember me
          </label>
        </div>
        <div className="text-sm">
          <Link to="/forgot-password" className="font-semibold text-gray-600 hover:text-gray-900 hover:underline transition-colors">
            Forgot password?
          </Link>
        </div>
      </div>
      
      {/* Submit Button (Black Style) */}
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
            Signing in...
          </>
        ) : (
          <>
            <FiLogIn className="h-5 w-5 mr-2" />
            Sign in to Account
          </>
        )}
      </button>
    </form>
  );
};

export default LoginForm;
