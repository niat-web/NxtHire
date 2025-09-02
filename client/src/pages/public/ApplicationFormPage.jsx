// client/src/pages/public/ApplicationFormPage.jsx
import React from 'react';
import { motion } from 'framer-motion';
import InitialApplicationForm from '../../components/forms/InitialApplicationForm';
import nxtWaveLogo from '/logo.svg'; 
import { FiCheckCircle } from 'react-icons/fi';

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
    <div className="min-h-screen w-full bg-slate-50 font-sans antialiased">
      <div className="flex items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-6xl mx-auto md:grid md:grid-cols-5 md:gap-10">
          {/* Left Column: Introduction */}
          <motion.div
            variants={introVariants}
            initial="hidden"
            animate="visible"
            className="md:col-span-2 text-slate-800 p-8 md:p-0"
          >
            <img src={nxtWaveLogo} alt="NxtWave Hire" className="h-12 mb-8" />
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
              Become an Expert Interviewer
            </h1>
            <p className="mt-4 text-slate-600 leading-relaxed">
              Leverage your industry experience to identify and mentor the next generation of top tech professionals. Join us in our mission to build a world-class talent ecosystem.
            </p>
            <ul className="mt-8 space-y-4">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start">
                  <FiCheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="ml-3 text-slate-700">{benefit}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Right Column: Form Card */}
          <motion.div
            variants={formVariants}
            initial="hidden"
            animate="visible"
            className="md:col-span-3 mt-10 md:mt-0"
          >
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-8 sm:p-10">
              <InitialApplicationForm />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationFormPage;
