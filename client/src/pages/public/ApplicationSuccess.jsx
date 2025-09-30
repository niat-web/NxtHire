// // client/src/pages/public/ApplicationSuccess.jsx
// import React from 'react';
// import { useParams, Link } from 'react-router-dom';
// import { FiCheckCircle, FiHome, FiMail, FiLinkedin, FiClipboard } from 'react-icons/fi';
// import logoSrc from '/logo.svg';

// const ApplicationSuccess = () => {
//   const { id } = useParams();

//   const copyToClipboard = () => {
//     navigator.clipboard.writeText(id);
//     // You could add a toast notification here for better UX, but this is a simple implementation.
//     alert("Application ID copied to clipboard!");
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-green-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
//       {/* Background grid pattern for a subtle texture */}
//       <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10"></div>
      
//       {/* Main content card with enhanced styling */}
//       <div className="w-full max-w-lg bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 sm:p-10 border border-slate-200/50 relative overflow-hidden">
//         {/* Decorative gradient overlay inside the card */}
//         <div className="absolute inset-0 bg-gradient-to-br from-green-600/5 via-blue-600/5 to-indigo-600/5 -z-10"></div>
        
//         {/* Content */}
//         <div className="text-center">
            
//             <div className="inline-flex items-center justify-center p-3 bg-green-100 rounded-full mb-6 ring-8 ring-green-50">
//               <FiCheckCircle className="h-12 w-12 text-green-600" />
//             </div>
            
//             <h1 className="text-3xl font-extrabold bg-gradient-to-r from-slate-800 to-green-700 bg-clip-text text-transparent">
//               Application Submitted!
//             </h1>
//             <p className="mt-2 text-slate-600">
//               Thank you for applying to become a NxtWave Interviewer.
//             </p>

//             <div className="my-8 text-left bg-slate-50/70 p-6 rounded-xl border border-slate-200/80">
//               <h3 className="font-semibold text-lg text-slate-800 mb-4">What happens next?</h3>
//               <ol className="relative border-l border-slate-200 ml-2">
//                 <li className="mb-6 ml-6">
//                   <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-4 ring-white">
//                       <FiLinkedin className="w-3 h-3 text-blue-600" />
//                   </span>
//                   <h4 className="font-semibold text-slate-700">Profile Review</h4>
//                   <p className="text-sm text-slate-500">Our team will review your LinkedIn profile within 1 business days.</p>
//                 </li>
//                 <li className="ml-6">
//                   <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-4 ring-white">
//                       <FiMail className="w-3 h-3 text-blue-600" />
//                   </span>
//                   <h4 className="font-semibold text-slate-700">Notification</h4>
//                   <p className="text-sm text-slate-500">We'll contact you via email or WhatsApp with the next steps.</p>
//                 </li>
//               </ol>
//             </div>

//             <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
//               <Link
//                 to="/"
//                 className="group relative w-full sm:w-auto inline-flex justify-center py-3 px-6 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
//               >
//                 <FiHome className="mr-2 h-5 w-5" />
//                 Back to Home
//               </Link>
//               <a
//                 href="https://mail.google.com"
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-slate-300 text-sm font-semibold rounded-xl text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
//               >
//                   <FiMail className="mr-2 h-5 w-5" />
//                   Check Email
//               </a>
//             </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ApplicationSuccess;


import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Home, Mail, Linkedin, Copy, Check, Sparkles } from 'lucide-react';

const ApplicationSuccess = () => {
  const { id } = useParams();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 flex items-center justify-center">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-indigo-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-purple-200/20 rounded-full blur-2xl"></div>
      </div>

      <div className="relative w-full max-w-md mx-auto">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/50">
          {/* Success Icon */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center relative">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4 rounded-full shadow-lg">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 text-yellow-400">
                <Sparkles className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-slate-800 to-blue-700 bg-clip-text text-transparent">
              Application Submitted!
            </h1>
            <p className="text-slate-600 text-sm">
              Thank you for applying to become a{' '}
              <span className="font-semibold text-blue-600">NxtWave Interviewer</span>
            </p>
          </div>

          

          {/* What's Next */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 text-center">What's Next?</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full flex-shrink-0">
                  <Linkedin className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm">Profile Review</h4>
                  <p className="text-xs text-slate-600">We'll review your profile within 2-3 business day</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full flex-shrink-0">
                  <Mail className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm">Get Notified</h4>
                  <p className="text-xs text-slate-600">We'll contact you via email or WhatsApp</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              to="/"
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transform hover:scale-[1.02] transition-all duration-200"
            >
              <Home className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
            
            <a
              href="https://mail.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 font-semibold py-3 px-4 rounded-xl hover:bg-slate-50 hover:border-blue-300 transform hover:scale-[1.02] transition-all duration-200"
            >
              <Mail className="h-4 w-4" />
              <span>Check Email</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationSuccess;
