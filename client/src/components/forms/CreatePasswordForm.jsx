// client/src/components/forms/CreatePasswordForm.jsx
import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { createPassword } from '../../api/auth.api';
import { useAlert } from '../../hooks/useAlert';

const CreatePasswordForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showSuccess, showError } = useAlert();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const token = queryParams.get('token');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ mode: 'onBlur' });

  const passwordValue = watch('password', '');

  const checkPasswordStrength = (password) => {
    let score = 0;
    if (!password) return score;

    // Award points for length
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    // Award points for character types
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    
    return Math.min(score, 4); // Max score is 4
  };

  const passwordStrength = checkPasswordStrength(passwordValue);
  const strengthLabels = ['Very Weak', 'Weak', 'Okay', 'Good', 'Strong'];
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500'];

  const onSubmit = async (data) => {
    if (!token) {
      showError('Invalid or missing token. Please check your link and try again.');
      return;
    }

    try {
      await createPassword({
        token,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });

      showSuccess('Password set successfully! You can now log in.');
      navigate('/login');
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to set password. Please try again.');
    }
  };
  
  const formInputBaseClasses = "block w-full pl-10 pr-10 py-3 border-2 placeholder-slate-400 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-50 text-sm font-medium transition-all duration-200 bg-slate-50/50 hover:bg-white focus:bg-white shadow-sm";
  const formInputNormalClasses = "border-slate-300 focus:border-indigo-500 focus:ring-indigo-500";
  const formInputErrorClasses = "border-red-300 focus:border-red-500 focus:ring-red-500";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="password">
          Password
        </label>
        <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400"/>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className={`${formInputBaseClasses} ${errors.password ? formInputErrorClasses : formInputNormalClasses}`}
              placeholder="Enter your new password"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters long',
                },
              })}
            />
            <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                onClick={() => setShowPassword(!showPassword)}
            >
                {showPassword ? <FiEyeOff className="h-5 w-5"/> : <FiEye className="h-5 w-5"/>}
            </button>
        </div>
        {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>}
        {passwordValue && (
            <div className="mt-2">
                <div className="flex justify-between mb-1">
                    <span className="text-xs font-medium text-slate-600">Password Strength</span>
                    <span className={`text-xs font-bold ${['text-red-600', 'text-orange-600', 'text-yellow-600', 'text-lime-600', 'text-green-600'][passwordStrength]}`}>
                        {strengthLabels[passwordStrength]}
                    </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                    className={`h-2 rounded-full transition-all duration-300 ${strengthColors[passwordStrength]}`}
                    style={{ width: `${(passwordStrength + 1) * 20}%` }}
                    ></div>
                </div>
            </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="confirmPassword">
          Confirm Password
        </label>
        <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400"/>
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              className={`${formInputBaseClasses} ${errors.confirmPassword ? formInputErrorClasses : formInputNormalClasses}`}
              placeholder="Confirm your new password"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === passwordValue || 'Passwords do not match',
              })}
            />
            <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
                {showConfirmPassword ? <FiEyeOff className="h-5 w-5"/> : <FiEye className="h-5 w-5"/>}
            </button>
        </div>
        {errors.confirmPassword && <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>}
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
                    <FiLock className="h-5 w-5 text-white/80 group-hover:text-white" />
                )}
            </span>
          {isSubmitting ? 'Setting Password...' : 'Create Password & Login'}
        </button>
      </div>
    </form>
  );
};

export default CreatePasswordForm;