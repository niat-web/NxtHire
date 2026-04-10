// client/src/pages/public/Login.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../hooks/useAuth';
import { useAlert } from '../../hooks/useAlert';
import {
  Mail, Lock, Eye, EyeOff, ArrowRight, Loader2,
  Users, IndianRupee, Shield, Calendar, CheckCircle, Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import SEO from '../../components/common/SEO';
import nxtWaveLogo from '/logo.svg';

const Login = () => {
  const navigate = useNavigate();
  const { currentUser, login, googleLogin } = useAuth();
  const { showError } = useAlert();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  useEffect(() => {
    if (currentUser) {
      const dest = currentUser.role === 'admin' ? '/admin/dashboard' : '/interviewer/dashboard';
      navigate(dest, { replace: true });
    }
  }, [currentUser, navigate]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const user = await login(data.email, data.password);
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/interviewer/dashboard');
    } catch (error) {
      showError(error.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setGoogleLoading(true);
    try {
      const user = await googleLogin(credentialResponse.credential);
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/interviewer/dashboard');
    } catch (error) {
      showError(error.response?.data?.message || 'Google sign-in failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const features = [
    { icon: Users, text: '100+ active interviewers on the platform' },
    { icon: Calendar, text: 'Flexible scheduling on your own time' },
    { icon: IndianRupee, text: 'Fast & transparent payouts' },
    { icon: Shield, text: 'Secure & reliable platform' },
  ];

  return (
    <div className="h-screen w-full flex overflow-hidden">
      <SEO title="Sign In" description="Sign in to your NxtHire account to manage interviews and track earnings." path="/login" />

      {/* ─── Left Panel — Branding ─────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[48%] bg-slate-900 relative overflow-hidden">
        {/* Gradient overlays */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-600/20 via-transparent to-violet-600/10" />
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl" />
        </div>

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div>
            <img src={nxtWaveLogo} alt="NxtHire" className="h-10 brightness-0 invert" />
          </div>

          {/* Main content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-indigo-300 text-xs font-medium mb-6">
                <Sparkles size={12} /> Interviewer Platform
              </span>

              <h2 className="text-3xl xl:text-4xl font-bold text-white leading-tight mb-4">
                Manage interviews,<br />
                track earnings &<br />
                <span className="text-indigo-400">grow together.</span>
              </h2>

              <p className="text-slate-400 text-base leading-relaxed max-w-sm mb-10">
                Join NxtWave's interviewer community. Sign in to access your dashboard and manage everything in one place.
              </p>

              <div className="space-y-4">
                {features.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                      <item.icon size={16} className="text-indigo-400" />
                    </div>
                    <span className="text-sm text-slate-300">{item.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Footer */}
          <p className="text-slate-600 text-xs">
            &copy; {new Date().getFullYear()} NxtWave. All rights reserved.
          </p>
        </div>
      </div>

      {/* ─── Right Panel — Login Form ──────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center bg-[#F7F8FA] px-6 py-8 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[400px]"
        >
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <img src={nxtWaveLogo} alt="NxtHire" className="h-9 mx-auto" />
          </div>

          {/* Header */}
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-gray-900">Sign in</h1>
            <p className="mt-1 text-sm text-gray-500">
              Enter your credentials to access your dashboard.
            </p>
          </div>

          {/* Google Sign-In */}
          <div className="mb-5">
            {googleLoading ? (
              <div className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-gray-200 text-sm text-gray-500 bg-white">
                <Loader2 size={16} className="animate-spin" /> Signing in with Google...
              </div>
            ) : (
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => showError('Google sign-in failed.')}
                  size="large"
                  width="400"
                  shape="rectangular"
                  text="signin_with"
                  theme="outline"
                />
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-[#F7F8FA] text-xs text-gray-400 uppercase tracking-wide">or</span>
            </div>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={cn(
                    'pl-10 h-11 rounded-xl text-sm bg-white',
                    errors.email ? 'border-red-400' : 'border-gray-200'
                  )}
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' },
                  })}
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className={cn(
                    'pl-10 pr-11 h-11 rounded-xl text-sm bg-white',
                    errors.password ? 'border-red-400' : 'border-gray-200'
                  )}
                  {...register('password', { required: 'Password is required' })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl h-11 text-sm font-semibold mt-2"
            >
              {isSubmitting ? (
                <><Loader2 size={16} className="animate-spin mr-2" /> Signing in...</>
              ) : (
                <>Sign In <ArrowRight size={16} className="ml-2" /></>
              )}
            </Button>
          </form>

          {/* Apply link */}
          <p className="mt-8 text-center text-sm text-gray-400">
            Want to become an interviewer?{' '}
            <Link to="/applicationform" className="text-indigo-600 font-medium hover:text-indigo-700">
              Apply here
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
