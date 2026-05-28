import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../hooks/useAuth';
import { useAlert } from '../../hooks/useAlert';
import {
  Mail, Lock, Eye, EyeOff, ArrowRight, Loader2,
  Users, IndianRupee, Shield, Calendar,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import SEO from '../../components/common/SEO';
import nxtWaveLogo from '/logo.svg';
import nxtWaveLogoLight from '/logo-light.svg';

const ACCENT = '#C0392B';
const DISPLAY = { fontFamily: 'Supreme, "Plus Jakarta Sans", system-ui, sans-serif' };

const Login = () => {
  const navigate = useNavigate();
  const { currentUser, login, googleLoginWithCode } = useAuth();
  const { showError } = useAlert();
  const [searchParams, setSearchParams] = useSearchParams();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const exchangedCodeRef = useRef(false);

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

  // Full-page redirect flow — button click redirects the whole tab to Google.
  const triggerGoogleRedirect = useGoogleLogin({
    flow: 'auth-code',
    ux_mode: 'redirect',
    redirect_uri: typeof window !== 'undefined' ? `${window.location.origin}/login` : undefined,
    scope: 'openid email profile',
  });

  // Handle Google's redirect back with ?code=...
  useEffect(() => {
    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');
    if (errorParam) {
      showError(`Google sign-in cancelled: ${errorParam}`);
      setSearchParams({}, { replace: true });
      return;
    }
    if (!code || exchangedCodeRef.current) return;
    exchangedCodeRef.current = true;
    setGoogleLoading(true);
    (async () => {
      try {
        const user = await googleLoginWithCode(code, `${window.location.origin}/login`);
        setSearchParams({}, { replace: true });
        navigate(user.role === 'admin' ? '/admin/dashboard' : '/interviewer/dashboard');
      } catch (error) {
        showError(error.response?.data?.message || 'Google sign-in failed. Please try again.');
        setSearchParams({}, { replace: true });
      } finally {
        setGoogleLoading(false);
      }
    })();
  }, [searchParams, googleLoginWithCode, navigate, showError, setSearchParams]);

  const features = [
    { icon: Users, text: '100+ active interviewers on the platform' },
    { icon: Calendar, text: 'Flexible scheduling on your own time' },
    { icon: IndianRupee, text: 'Fast & transparent payouts' },
    { icon: Shield, text: 'Secure & reliable platform' },
  ];

  return (
    <div className="h-screen w-full flex overflow-hidden bg-white">
      <SEO title="Sign In" description="Sign in to your NxtHire account to manage interviews and track earnings." path="/login" />

      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden bg-slate-900">
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-14 w-full">
          <div className="flex items-center gap-4">
            <img src={nxtWaveLogoLight} alt="NxtHire" className="h-8" />
            <div className="flex flex-col leading-none border-l border-white/15 pl-4">
              <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-slate-400">Admin Console</span>
              <span className="text-[10px] text-slate-500 mt-1">Operator access</span>
            </div>
          </div>

          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.2em] text-slate-300 mb-7">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: ACCENT }} />
                Interviewer Platform
              </span>

              <h2 style={DISPLAY} className="text-[40px] xl:text-[48px] font-semibold text-white leading-[1.05] tracking-tight mb-5">
                Control the platform without losing <em className="italic" style={{ color: ACCENT }}>operational clarity</em>.
              </h2>

              <p className="text-slate-400 text-[15px] leading-relaxed max-w-md mb-10">
                Review system activity, manage invites, monitor interviews, and handle operator workflows from a single protected surface.
              </p>

              <div className="space-y-2.5">
                {features.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 + i * 0.05 }}
                    className="flex items-center gap-3 py-2.5"
                  >
                    <div className="w-8 h-8 rounded-full border border-white/15 bg-white/5 flex items-center justify-center shrink-0 text-slate-200">
                      <item.icon size={14} />
                    </div>
                    <span className="text-[13.5px] text-slate-200">{item.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="flex items-center gap-6 pt-6 border-t border-white/10">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-slate-500">Ops Surface</p>
              <p className="text-[12px] text-slate-300 mt-1">Users · Interviewers · Bookings</p>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div>
              <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-slate-500">Access Mode</p>
              <p className="text-[12px] text-slate-300 mt-1">Secured</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-white px-6 py-8 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative w-full max-w-[420px]"
        >
          <div className="lg:hidden text-center mb-8">
            <img src={nxtWaveLogo} alt="NxtHire" className="h-9 mx-auto" />
          </div>

          <div className="mb-7">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.2em] text-slate-600 mb-4">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: ACCENT }} />
              Secure login
            </span>
            <h1 style={DISPLAY} className="text-[34px] font-semibold text-slate-900 tracking-tight leading-tight">Sign in</h1>
            <p className="mt-2 text-[13.5px] text-slate-600 leading-relaxed">
              Use your credentials to access dashboard operations and management tools.
            </p>
          </div>

          <div className="mb-4">
            <button
              type="button"
              onClick={() => triggerGoogleRedirect()}
              disabled={googleLoading}
              className="w-full inline-flex items-center justify-center gap-2.5 h-11 rounded-full border border-slate-200 bg-white text-[13px] font-semibold text-slate-900 transition-colors hover:border-slate-900 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {googleLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Signing in with Google…
                </>
              ) : (
                <>
                  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </>
              )}
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-white text-[10.5px] font-semibold text-slate-500 uppercase tracking-[0.2em]">or continue with email</span>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="email" className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@example.com"
                  className={cn('pl-10', errors.email && 'border-red-400 focus:border-red-500')}
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' },
                  })}
                />
              </div>
              {errors.email && <p className="mt-1.5 text-[12px] text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-[12.5px] font-semibold text-slate-700">
                  Password
                </label>
                <Link to="/forgot-password" className="text-[12px] text-slate-700 hover:text-[#C0392B] font-semibold">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className={cn('pl-10 pr-11', errors.password && 'border-red-400 focus:border-red-500')}
                  {...register('password', { required: 'Password is required' })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-[12px] text-red-600">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex h-11 items-center justify-center gap-2 rounded-full bg-slate-900 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-[#C0392B] disabled:opacity-50 mt-2"
            >
              {isSubmitting ? (
                <><Loader2 size={14} className="animate-spin" /> Signing in…</>
              ) : (
                <>Sign in <ArrowRight size={14} /></>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-[13px] text-slate-500">
            Want to become an interviewer?{' '}
            <Link to="/applicationform" className="text-slate-900 font-semibold hover:text-[#C0392B]">
              Apply here
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
