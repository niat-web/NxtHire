// // client/src/pages/public/SkillAssessmentSuccess.jsx
// import React from 'react';
// import { Link } from 'react-router-dom';
// import { FiCheckCircle, FiHome } from 'react-icons/fi';
// import Card from '../../components/common/Card';
// import Button from '../../components/common/Button';

// const SkillAssessmentSuccess = () => {
  
//   return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="max-w-lg mx-auto px-4 py-12">
//             <Card>
//                 <div className="text-center p-6">
//                     <div className="flex justify-center mb-4">
//                         <FiCheckCircle className="h-20 w-20 text-green-500" />
//                     </div>
                    
//                     <h2 className="text-2xl font-bold text-gray-900 mb-4">Thank You!</h2>
                    
//                     <p className="text-gray-600 mb-6 leading-relaxed">
//                         Thank you for completing the registration form and expressing your interest in becoming an interviewer with NxtWave. Your expertise is valuable to us, and we look forward to the possibility of working together.
//                     </p>
                    
//                     <p className="text-gray-600 mb-8">
//                         Our team will review your complete profile and get back to you with the next steps. Please keep an eye on your email.
//                     </p>
                    
//                     <Button
//                         to="/"
//                         variant="primary"
//                         icon={<FiHome />}
//                         iconPosition="left"
//                     >
//                         Back to Home
//                     </Button>
//                 </div>
//             </Card>
//         </div>
//     </div>
//   );
// };

// export default SkillAssessmentSuccess;


import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Home, Sparkles, Star } from 'lucide-react';

const SkillAssessmentSuccess = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      {/* Subtle background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-200/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-indigo-200/10 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-green-200/10 rounded-full blur-xl"></div>
      </div>

      <div className="relative w-full max-w-md mx-auto">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6">
          {/* Success Icon */}
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center relative">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-full shadow-lg">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 text-yellow-400">
                <Sparkles className="h-3 w-3" />
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-slate-800 to-blue-700 bg-clip-text text-transparent">
              Thank You!
            </h1>
          </div>

          {/* Content */}
          <div className="space-y-4 mb-6">
            <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-4 border border-slate-200/50">
              <p className="text-slate-700 text-sm leading-relaxed">
                Thank you for completing the registration form and expressing your interest in becoming an 
                <span className="font-semibold text-blue-700 mx-1">interviewer with NxtWave</span>. 
                Your expertise is valuable to us.
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200/50">
              <p className="text-slate-700 text-sm leading-relaxed">
                Our team will review your complete profile and get back to you with the next steps. 
                Please keep an eye on your email.
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <Link
              to="/"
              className="group inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <Home className="h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
              <span>Back to Home</span>
            </Link>
          </div>

          {/* Decorative dots */}
          <div className="flex justify-center gap-1 mt-4">
            <div className="w-1.5 h-1.5 bg-blue-300 rounded-full animate-pulse"></div>
            <div className="w-1.5 h-1.5 bg-indigo-300 rounded-full animate-pulse delay-200"></div>
            <div className="w-1.5 h-1.5 bg-purple-300 rounded-full animate-pulse delay-400"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillAssessmentSuccess;
