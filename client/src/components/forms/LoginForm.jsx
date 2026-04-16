// client/src/components/forms/LoginForm.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import { useAlert } from '../../hooks/useAlert';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showError } = useAlert();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
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
      const errorMessage =
        error.response?.data?.message || 'Invalid credentials. Please try again.';
      showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const iconCls = 'absolute left-3 top-1/2 -translate-y-1/2 text-gray-400';

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
          Email Address
        </label>
        <div className="relative">
          <Mail size={17} className={iconCls} />
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className={cn(
              'pl-10 h-10 rounded-xl',
              errors.email ? 'border-red-400' : 'border-gray-200'
            )}
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Please enter a valid email address',
              },
            })}
          />
        </div>
        {errors.email && (
          <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
          Password
        </label>
        <div className="relative">
          <Lock size={17} className={iconCls} />
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="Enter your password"
            className={cn(
              'pl-10 pr-10 h-10 rounded-xl',
              errors.password ? 'border-red-400' : 'border-gray-200'
            )}
            {...register('password', { required: 'Password is required' })}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-400 hover:text-gray-600"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </Button>
        </div>
        {errors.password && (
          <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
        )}
      </div>

      {/* Remember + Forgot */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            id="remember_me"
            type="checkbox"
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500/30 cursor-pointer"
          />
          <span className="text-sm text-gray-600">Remember me</span>
        </label>
        <Link
          to="/forgot-password"
          className="text-sm text-blue-600 hover:text-blue-600 font-medium transition-colors"
        >
          Forgot password?
        </Link>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={isSubmitting}
        variant="success"
        className="w-full rounded-xl"
        size="lg"
      >
        {isSubmitting ? (
          <>
            <Loader2 size={17} className="animate-spin mr-2" />
            Signing in...
          </>
        ) : (
          <>
            Sign In <ArrowRight size={17} className="ml-2" />
          </>
        )}
      </Button>
    </form>
  );
};

export default LoginForm;
