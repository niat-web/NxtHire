// client/src/components/forms/ResetPasswordForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FiLock, FiEye, FiEyeOff, FiCheck, FiLoader } from 'react-icons/fi';
import { resetPassword } from '../../api/auth.api';
import { useAlert } from '../../hooks/useAlert';

const ResetPasswordForm = ({ token }) => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useAlert();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ mode: 'onChange' });

  const passwordValue = watch('password', '');

  const checkPasswordStrength = (password) => {
    let score = 0;
    if (!password) return score;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    return Math.min(score, 5);
  };

  const passwordStrength = checkPasswordStrength(passwordValue);
  const strengthConfig = [
    { label: 'Too Weak', color: 'bg-gray-200', text: 'text-gray-400' }, // 0
    { label: 'Weak', color: 'bg-red-500', text: 'text-red-500' },       // 1
    { label: 'Fair', color: 'bg-orange-500', text: 'text-orange-500' }, // 2
    { label: 'Good', color: 'bg-yellow-500', text: 'text-yellow-600' }, // 3
    { label: 'Strong', color: 'bg-green-500', text: 'text-green-600' }, // 4
    { label: 'Excellent', color: 'bg-emerald-500', text: 'text-emerald-600' } // 5
  ];
  
  const currentStrength = strengthConfig[passwordStrength];

  const onSubmit = async (data) => {
    try {
      await resetPassword({
        token,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });

      showSuccess('Password reset successfully! Redirecting...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to reset password.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      
      {/* New Password Field */}
      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2" htmlFor="password">
          New Password
        </label>
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className={`block w-full pl-10 pr-10 py-2.5 bg-white border ${
                  errors.password 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-gray-900 focus:border-gray-900'
                } text-gray-900 text-sm rounded-lg focus:outline-none focus:ring-1 transition-colors shadow-sm`}
              placeholder="••••••••"
              {...register('password', {
                required: 'New password is required',
                minLength: {
                  value: 8,
                  message: 'At least 8 characters required',
                },
              })}
            />
            <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
            >
                {showPassword ? <FiEyeOff className="h-5 w-5"/> : <FiEye className="h-5 w-5"/>}
            </button>
        </div>
        {errors.password && <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.password.message}</p>}
        
        {/* Strength Meter */}
        {passwordValue && !errors.password && (
            <div className="mt-3">
                <div className="flex justify-between items-end mb-1">
                    <span className="text-[10px] font-semibold text-gray-500 uppercase">Strength</span>
                    <span className={`text-xs font-bold ${currentStrength.text}`}>
                        {currentStrength.label}
                    </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div
                        className={`h-full transition-all duration-500 ease-out ${currentStrength.color}`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    ></div>
                </div>
            </div>
        )}
      </div>

      {/* Confirm Password Field */}
      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2" htmlFor="confirmPassword">
          Confirm Password
        </label>
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              className={`block w-full pl-10 pr-10 py-2.5 bg-white border ${
                  errors.confirmPassword 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-gray-900 focus:border-gray-900'
                } text-gray-900 text-sm rounded-lg focus:outline-none focus:ring-1 transition-colors shadow-sm`}
              placeholder="••••••••"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === passwordValue || 'Passwords do not match',
              })}
            />
            <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
                {showConfirmPassword ? <FiEyeOff className="h-5 w-5"/> : <FiEye className="h-5 w-5"/>}
            </button>
        </div>
        {errors.confirmPassword && <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.confirmPassword.message}</p>}
      </div>

      {/* Submit Button */}
      <div className="pt-2">
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
                Resetting...
              </>
          ) : (
              <>
                <FiCheck className="h-5 w-5 mr-2" />
                Reset Password
              </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ResetPasswordForm;
