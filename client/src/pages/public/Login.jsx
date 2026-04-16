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
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900">
        {/* Premium gradient overlays */}
        <div className="absolute inset-0">
          <div className="absolute -bottom-32 -left-20 w-[500px] h-[500px] bg-blue-500/15 rounded-full blur-3xl" />
          <div className="absolute -top-32 -right-20 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl" />
        </div>

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.2) 1px, transparent 1px)',
            backgroundSize: '44px 44px',
          }}
        />

        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-14 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src={nxtWaveLogo} alt="NxtHire" className="h-10 brightness-0 invert" />
            <div className="flex flex-col leading-none">
              <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-blue-300/80">Admin Console</span>
              <span className="text-[10px] text-slate-500 mt-0.5">Operator access</span>
            </div>
          </div>

          {/* Main content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur border border-white/10 text-blue-300 text-xs font-semibold tracking-wide mb-7">
                <Sparkles size={12} /> Interviewer Platform
              </span>

              <h2 className="text-4xl xl:text-[2.75rem] font-extrabold text-white leading-[1.1] tracking-tight mb-5">
                Control the interviewer<br />
                platform without losing<br />
                <span className="text-blue-300">
                  operational clarity.
                </span>
              </h2>

              <p className="text-slate-400 text-base leading-relaxed max-w-md mb-10">
                Review system activity, manage invites, monitor interviews, and handle operator workflows from a single protected surface.
              </p>

              <div className="space-y-3">
                {features.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-white/10 flex items-center justify-center shrink-0">
                      <item.icon size={17} className="text-blue-300" />
                    </div>
                    <span className="text-sm text-slate-200 font-medium">{item.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Footer — info strip */}
          <div className="flex items-center gap-3 pt-6 border-t border-white/10">
            <div className="flex-1">
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-slate-500">Ops Surface</p>
              <p className="text-xs text-slate-300 mt-0.5 font-medium">Users &middot; Interviewers &middot; Bookings</p>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="flex-1">
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-slate-500">Access Mode</p>
              <p className="text-xs text-blue-300 mt-0.5 font-medium">Secured</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Right Panel — Login Form ──────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/30 px-6 py-8 overflow-y-auto relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 right-10 w-64 h-64 bg-blue-100/40 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-64 h-64 bg-blue-100/40 rounded-full blur-3xl" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative w-full max-w-[420px]"
        >
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <img src={nxtWaveLogo} alt="NxtHire" className="h-9 mx-auto" />
          </div>

          {/* Elevated card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8">
          {/* Header */}
          <div className="mb-6">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mb-3 text-[10px] font-bold tracking-widest uppercase text-blue-700 bg-blue-50 border border-blue-100 rounded-full">
              <Shield size={10} /> Secure login
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Sign in to admin</h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Use your admin credentials to access dashboard operations and management tools.
            </p>
          </div>

          {/* Google Sign-In */}
          <div className="mb-4">
            {googleLoading ? (
              <div className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-slate-200 text-sm text-slate-500 bg-white">
                <Loader2 size={16} className="animate-spin" /> Signing in with Google...
              </div>
            ) : (
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => showError('Google sign-in failed.')}
                  size="large"
                  width="356"
                  shape="rectangular"
                  text="signin_with"
                  theme="outline"
                />
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-white text-[10px] font-semibold text-slate-400 uppercase tracking-[0.15em]">or continue with email</span>
            </div>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-[13px] font-semibold text-slate-700 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@example.com"
                  className={cn(
                    'pl-10 h-11 rounded-xl text-sm bg-slate-50/50 focus:bg-white transition-colors',
                    errors.email ? 'border-red-400' : 'border-slate-200'
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
                <label htmlFor="password" className="block text-[13px] font-semibold text-slate-700">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs text-blue-600 hover:text-blue-700 font-semibold">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className={cn(
                    'pl-10 pr-11 h-11 rounded-xl text-sm bg-slate-50/50 focus:bg-white transition-colors',
                    errors.password ? 'border-red-400' : 'border-slate-200'
                  )}
                  {...register('password', { required: 'Password is required' })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
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
              className="w-full rounded-xl h-11 text-sm font-bold mt-2 text-white border-0 bg-blue-600 hover:bg-blue-700 shadow-lg transition-all"
            >
              {isSubmitting ? (
                <><Loader2 size={16} className="animate-spin mr-2" /> Signing in...</>
              ) : (
                <>Sign In <ArrowRight size={16} className="ml-2" /></>
              )}
            </Button>
          </form>
          </div>

          {/* Apply link */}
          <p className="mt-6 text-center text-sm text-slate-500">
            Want to become an interviewer?{' '}
            <Link to="/applicationform" className="text-blue-600 font-semibold hover:text-blue-700">
              Apply here
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
