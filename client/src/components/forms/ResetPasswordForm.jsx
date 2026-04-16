// client/src/components/forms/ResetPasswordForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Lock, Eye, EyeOff, Check, Loader2 } from 'lucide-react';
import { resetPassword } from '../../api/auth.api';
import { useAlert } from '../../hooks/useAlert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

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
    { label: 'Too Weak', color: 'bg-gray-200', text: 'text-gray-400' },
    { label: 'Weak', color: 'bg-red-500', text: 'text-red-500' },
    { label: 'Fair', color: 'bg-blue-600', text: 'text-blue-600' },
    { label: 'Good', color: 'bg-yellow-500', text: 'text-yellow-600' },
    { label: 'Strong', color: 'bg-green-500', text: 'text-green-600' },
    { label: 'Excellent', color: 'bg-emerald-500', text: 'text-emerald-500' }
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
        <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-2" htmlFor="password">
          New Password
        </label>
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className={cn(
                'pl-10 pr-10 h-10',
                errors.password
                  ? 'border-red-300 focus-visible:ring-red-500 focus-visible:border-red-500'
                  : 'border-gray-300'
              )}
              placeholder="--------"
              {...register('password', {
                required: 'New password is required',
                minLength: {
                  value: 8,
                  message: 'At least 8 characters required',
                },
              })}
            />
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
            >
                {showPassword ? <EyeOff className="h-5 w-5"/> : <Eye className="h-5 w-5"/>}
            </Button>
        </div>
        {errors.password && <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.password.message}</p>}

        {/* Strength Meter */}
        {passwordValue && !errors.password && (
            <div className="mt-3">
                <div className="flex justify-between items-end mb-1">
                    <span className="text-xs font-semibold text-gray-500 uppercase">Strength</span>
                    <span className={cn('text-xs font-semibold', currentStrength.text)}>
                        {currentStrength.label}
                    </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div
                        className={cn('h-full transition-all duration-500 ease-out', currentStrength.color)}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    ></div>
                </div>
            </div>
        )}
      </div>

      {/* Confirm Password Field */}
      <div>
        <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-2" htmlFor="confirmPassword">
          Confirm Password
        </label>
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              className={cn(
                'pl-10 pr-10 h-10',
                errors.confirmPassword
                  ? 'border-red-300 focus-visible:ring-red-500 focus-visible:border-red-500'
                  : 'border-gray-300'
              )}
              placeholder="--------"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === passwordValue || 'Passwords do not match',
              })}
            />
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-400 hover:text-gray-600"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
                {showConfirmPassword ? <EyeOff className="h-5 w-5"/> : <Eye className="h-5 w-5"/>}
            </Button>
        </div>
        {errors.confirmPassword && <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.confirmPassword.message}</p>}
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full"
          size="lg"
          isLoading={isSubmitting}
        >
          {isSubmitting ? (
            'Resetting...'
          ) : (
            <>
              <Check className="h-5 w-5 mr-2" />
              Reset Password
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default ResetPasswordForm;
