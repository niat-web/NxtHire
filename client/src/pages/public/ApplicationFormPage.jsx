
import React from 'react';
import { motion } from 'framer-motion';
import InitialApplicationForm from '../../components/forms/InitialApplicationForm';
import nxtWaveLogo from '/logo.svg'; 
import { CheckCircle2, Sparkles } from 'lucide-react';

const ApplicationFormPage = () => {
  const introVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const formVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut", delay: 0.2 } },
  };

  const benefits = [
    "Competitive Compensation",
    "Flexible Work Schedule",
    "Join an Elite Professional Network",
    "Shape the Future of Tech Talent"
  ];

  return (
    <div className="min-h-screen w-full bg-slate-950 font-sans antialiased relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-orange-500/10 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-teal-500/10 blur-[100px]" />
      </div>

      <div className="flex items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8 relative z-10">
        <div className="w-full max-w-7xl mx-auto md:grid md:grid-cols-5 md:gap-16 items-start">
          {/* Left Column: Introduction */}
          <motion.div
            variants={introVariants}
            initial="hidden"
            animate="visible"
            className="md:col-span-2 pt-10"
          >
            <div className="mb-8">
              <img src={nxtWaveLogo} alt="NxtWave Hire" className="h-12 mb-8" />
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-medium mb-6">
                <Sparkles size={14} />
                Join the Revolution
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight mb-6">
                Become an <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">
                  Expert Interviewer
                </span>
              </h1>
              <p className="text-lg text-slate-400 leading-relaxed mb-8">
                Leverage your industry experience to identify and mentor the next generation of top tech professionals. 
                Join us in our mission to build a world-class talent ecosystem.
              </p>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800">
              <h3 className="text-white font-semibold mb-4">Why Join Us?</h3>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start group">
                    <div className="mt-0.5 mr-3 p-1 rounded-full bg-teal-500/10 text-teal-400 group-hover:bg-teal-500 group-hover:text-white transition-colors">
                      <CheckCircle2 size={16} />
                    </div>
                    <span className="text-slate-300 group-hover:text-white transition-colors">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Right Column: Form Card */}
          <motion.div
            variants={formVariants}
            initial="hidden"
            animate="visible"
            className="md:col-span-3 mt-10 md:mt-0"
          >
            <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-800 p-1">
              <div className="bg-slate-950/50 rounded-[22px] p-6 sm:p-10">
                <InitialApplicationForm />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationFormPage;
