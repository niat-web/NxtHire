import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import SEO from '../../components/common/SEO';
import InitialApplicationForm from '../../components/forms/InitialApplicationForm';
import {
  CheckCircle, ArrowLeft,
  IndianRupee, Wifi, Users, Star, Shield, Zap
} from 'lucide-react';
import nxtHireLogoLight from '/logo-light.svg';

const ACCENT = '#C0392B';
const DISPLAY = { fontFamily: 'Supreme, "Plus Jakarta Sans", system-ui, sans-serif' };

const benefits = [
  { icon: IndianRupee, title: 'Earn up to ₹1,000', desc: 'Per interview conducted on the platform' },
  { icon: Wifi, title: 'Fully remote', desc: 'Work from anywhere with flexible scheduling' },
  { icon: Users, title: '100+ professionals', desc: 'Join a growing community of experts' },
  { icon: Star, title: 'Shape careers', desc: 'Help the next generation of tech talent' },
];

const ApplicationFormPage = () => {
  return (
    <div className="h-screen bg-white flex flex-col lg:flex-row overflow-hidden">
      <SEO title="Apply as Interviewer" description="Apply to become a freelance interviewer at NxtWave. Fill out the application form to get started." path="/applicationform" />

      <motion.div
        className="lg:w-[420px] xl:w-[460px] shrink-0 bg-primary text-white p-8 lg:p-10 flex flex-col justify-between lg:h-screen overflow-y-auto"
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <div className="flex items-center justify-between mb-10">
            <Link to="/" aria-label="NxtHire home">
              <img src={nxtHireLogoLight} alt="NxtHire" className="h-7" />
            </Link>
            <Link to="/" className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground/70 hover:text-white transition-colors font-medium">
              <ArrowLeft size={13} /> Back
            </Link>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/40 mb-5">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: ACCENT }} />
            Apply
          </span>

          <h2 style={DISPLAY} className="text-[32px] lg:text-[38px] font-semibold leading-[1.08] tracking-tight mb-4">
            Become a <em className="italic" style={{ color: ACCENT }}>tech interviewer</em>.
          </h2>
          <p className="text-muted-foreground/70 text-[13.5px] leading-relaxed mb-8 max-w-sm">
            Join our community of industry professionals conducting interviews and shaping the careers of aspiring developers.
          </p>

          <div className="space-y-1">
            {benefits.map((item, i) => (
              <motion.div
                key={i}
                className="flex items-start gap-3.5 py-3 border-t border-white/10"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.05 }}
              >
                <div className="w-8 h-8 rounded-full border border-white/15 bg-white/5 flex items-center justify-center shrink-0 text-slate-200">
                  <item.icon size={14} />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-white">{item.title}</p>
                  <p className="text-[12px] text-muted-foreground/70 mt-0.5">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10">
          <div className="grid grid-cols-3 gap-4">
            {[
              { num: '500+', label: 'Interviews' },
              { num: '100+', label: 'Interviewers' },
              { num: '₹1000', label: 'Per interview' },
            ].map((stat, i) => (
              <div key={i}>
                <p style={DISPLAY} className="text-[22px] font-semibold text-white tracking-tight">{stat.num}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-semibold mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="flex-1 overflow-y-auto lg:h-screen bg-[#FBFAF7]">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 py-10 lg:py-14">
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.2em] text-foreground/80">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: ACCENT }} />
              Application
            </span>
            <h1 style={DISPLAY} className="mt-4 text-[34px] sm:text-[40px] font-semibold text-foreground tracking-tight leading-tight">
              Interviewer application.
            </h1>
            <p className="mt-2 text-[13.5px] text-foreground/80">
              Tell us about yourself — it takes less than 2 minutes.
            </p>
          </motion.div>

          <motion.div
            className="bg-white rounded-2xl border border-border p-6 sm:p-8"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.15 }}
          >
            <InitialApplicationForm />
          </motion.div>

          <motion.div
            className="mt-6 flex flex-wrap items-center justify-center gap-4 text-[12px] text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-1.5">
              <Shield size={12} />
              <span>Your data is secure</span>
            </div>
            <span className="w-1 h-1 bg-slate-300 rounded-full" />
            <div className="flex items-center gap-1.5">
              <CheckCircle size={12} />
              <span>No spam, ever</span>
            </div>
            <span className="w-1 h-1 bg-slate-300 rounded-full" />
            <div className="flex items-center gap-1.5">
              <Zap size={12} />
              <span>Quick review process</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationFormPage;
