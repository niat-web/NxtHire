// client/src/components/forms/CreatePasswordForm.jsx
import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { createPassword } from '../../api/auth.api';
import { useAlert } from '../../hooks/useAlert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

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

    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    return Math.min(score, 4);
  };

  const passwordStrength = checkPasswordStrength(passwordValue);
  const strengthLabels = ['Very Weak', 'Weak', 'Okay', 'Good', 'Strong'];
  const strengthColors = ['bg-red-500', 'bg-indigo-600', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500'];

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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="password">
          Password
        </label>
        <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400"/>
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className={cn(
                'pl-10 pr-10 h-11 rounded-xl',
                errors.password ? 'border-red-300 focus-visible:ring-red-500' : 'border-slate-300'
              )}
              placeholder="Enter your new password"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters long',
                },
              })}
            />
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-slate-400 hover:text-slate-600"
                onClick={() => setShowPassword(!showPassword)}
            >
                {showPassword ? <EyeOff className="h-5 w-5"/> : <Eye className="h-5 w-5"/>}
            </Button>
        </div>
        {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>}
        {passwordValue && (
            <div className="mt-2">
                <div className="flex justify-between mb-1">
                    <span className="text-xs font-medium text-slate-600">Password Strength</span>
                    <span className={cn(
                      'text-xs font-semibold',
                      ['text-red-600', 'text-indigo-600', 'text-yellow-600', 'text-lime-600', 'text-green-600'][passwordStrength]
                    )}>
                        {strengthLabels[passwordStrength]}
                    </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                    className={cn('h-2 rounded-full transition-all duration-300', strengthColors[passwordStrength])}
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
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400"/>
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              className={cn(
                'pl-10 pr-10 h-11 rounded-xl',
                errors.confirmPassword ? 'border-red-300 focus-visible:ring-red-500' : 'border-slate-300'
              )}
              placeholder="Confirm your new password"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === passwordValue || 'Passwords do not match',
              })}
            />
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-slate-400 hover:text-slate-600"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
                {showConfirmPassword ? <EyeOff className="h-5 w-5"/> : <Eye className="h-5 w-5"/>}
            </Button>
        </div>
        {errors.confirmPassword && <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>}
      </div>

      <div className="!mt-8">
        <Button
          type="submit"
          disabled={isSubmitting}
          variant="success"
          size="lg"
          className="w-full rounded-xl shadow-md font-semibold"
          isLoading={isSubmitting}
        >
          {isSubmitting ? (
            'Setting Password...'
          ) : (
            <>
              <Lock className="h-5 w-5 mr-2" />
              Create Password & Login
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default CreatePasswordForm;
