// client/src/pages/public/Login.jsx
import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import LoginForm from '../../components/forms/LoginForm';
import { useAuth } from '../../hooks/useAuth';
import { Shield, Users, IndianRupee } from 'lucide-react';
import nxtWaveLogo from '/logo.svg';

const Login = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      const destination = currentUser.role === 'admin' ? '/admin/dashboard' : '/interviewer/dashboard';
      navigate(destination, { replace: true });
    }
  }, [currentUser, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left panel — branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-emerald-600 to-emerald-700 relative overflow-hidden">
        {/* dot pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div>
            <img src={nxtWaveLogo} alt="NxtWave" className="h-10 brightness-0 invert" />
          </div>

          <div>
            <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
              Welcome back to the Interviewer Community
            </h2>
            <p className="text-emerald-100 text-lg leading-relaxed max-w-md">
              Sign in to manage interviews, track earnings, and stay connected with your community.
            </p>

            <div className="mt-10 space-y-4">
              {[
                { icon: Users, text: '100+ active interviewers' },
                { icon: IndianRupee, text: 'Fast & transparent payouts' },
                { icon: Shield, text: 'Secure & reliable platform' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-emerald-100">
                  <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center">
                    <item.icon size={18} className="text-white" />
                  </div>
                  <span className="text-sm font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-emerald-200 text-xs">
            &copy; {new Date().getFullYear()} NxtWave. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <img src={nxtWaveLogo} alt="NxtWave" className="h-9 mx-auto" />
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Sign in to your account
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Enter your credentials to access the dashboard.
            </p>
          </div>

          <LoginForm />

          <p className="mt-8 text-center text-sm text-gray-400">
            Want to become an interviewer?{' '}
            <Link to="/applicationform" className="text-emerald-600 hover:text-emerald-600 font-medium">
              Apply here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
