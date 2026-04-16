import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import SEO from '../../components/common/SEO';
import InitialApplicationForm from '../../components/forms/InitialApplicationForm';
import {
  CheckCircle, ArrowLeft,
  IndianRupee, Wifi, Users, Star, Shield, Zap
} from 'lucide-react';

const benefits = [
  { icon: IndianRupee, title: 'Earn up to ₹1,000', desc: 'Per interview conducted on the platform' },
  { icon: Wifi, title: 'Fully Remote', desc: 'Work from anywhere with flexible scheduling' },
  { icon: Users, title: '100+ Professionals', desc: 'Join a growing community of experts' },
  { icon: Star, title: 'Shape Careers', desc: 'Help the next generation of tech talent' },
];

const ApplicationFormPage = () => {
  return (
    <div className="h-screen bg-gray-50 flex flex-col lg:flex-row overflow-hidden">
      <SEO title="Apply as Interviewer" description="Apply to become a freelance interviewer at NxtWave. Fill out the application form to get started." path="/applicationform" />

          {/* ─── LEFT: Branding Panel ──────────────────────────────────────── */}
          <motion.div
            className="lg:w-[420px] xl:w-[460px] shrink-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8 lg:p-10 flex flex-col justify-between lg:h-screen overflow-y-auto"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div>
              {/* Back link */}
              <Link to="/" className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-blue-400 transition-colors font-medium mb-8">
                <ArrowLeft size={14} /> Back to Home
              </Link>



              {/* Heading */}
              <h2 className="text-2xl lg:text-3xl font-semibold leading-tight mb-3">
                Become a <span className="text-blue-400">Tech Interviewer</span>
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">
                Join our community of industry professionals conducting mock interviews and shaping the careers of aspiring developers.
              </p>

              {/* Benefits */}
              <div className="space-y-4">
                {benefits.map((item, i) => (
                  <motion.div
                    key={i}
                    className="flex items-start gap-3.5 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.08 }}
                  >
                    <div className="w-9 h-9 rounded-lg bg-blue-500/15 flex items-center justify-center shrink-0">
                      <item.icon size={17} className="text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{item.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Bottom stats */}
            <div className="mt-10 pt-6 border-t border-slate-700/50">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { num: '500+', label: 'Interviews' },
                  { num: '100+', label: 'Interviewers' },
                  { num: '₹1000', label: 'Per Interview' },
                ].map((stat, i) => (
                  <div key={i} className="text-center">
                    <p className="text-lg font-semibold text-blue-400">{stat.num}</p>
                    <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ─── RIGHT: Form Panel ─────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto lg:h-screen">
            <div className="max-w-2xl mx-auto px-5 sm:px-8 py-6 lg:py-8">

              {/* Form Title */}
              <motion.div
                className="mb-7"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
              >
                <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 tracking-tight">
                  Interviewer Application
                </h1>
                <p className="mt-1.5 text-sm text-gray-500">
                  Tell us about yourself. It takes less than 2 minutes.
                </p>
              </motion.div>

              {/* Form Card */}
              <motion.div
                className="bg-white rounded-xl border border-gray-100 shadow-md p-5 sm:p-8"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <InitialApplicationForm />
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center gap-1.5">
                  <Shield size={13} />
                  <span>Your data is secure</span>
                </div>
                <span className="w-1 h-1 bg-gray-300 rounded-full" />
                <div className="flex items-center gap-1.5">
                  <CheckCircle size={13} />
                  <span>No spam, ever</span>
                </div>
                <span className="w-1 h-1 bg-gray-300 rounded-full" />
                <div className="flex items-center gap-1.5">
                  <Zap size={13} />
                  <span>Quick review process</span>
                </div>
              </motion.div>
            </div>
          </div>
    </div>
  );
};

export default ApplicationFormPage;
