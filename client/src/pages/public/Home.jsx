// client/src/pages/public/Home.jsx

import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  CurrencyRupeeIcon,
  UserGroupIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  PlayIcon,
  PlusIcon,
  MinusIcon,
  PencilSquareIcon,
  UserCircleIcon,
  RocketLaunchIcon,
} from '@heroicons/react/24/solid';
import Modal from '../../components/common/Modal';
import InitialApplicationForm from '../../components/forms/InitialApplicationForm';

// --- Reusable Components ---

const FAQItem = ({ question, answer, isOpen, onToggle }) => {
  const faqRef = useRef(null);

  useEffect(() => {
    if (isOpen && faqRef.current) {
      const timer = setTimeout(() => {
        faqRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <div 
      ref={faqRef} 
      className={`border-b border-gray-200 py-7 transition-all duration-300 ${isOpen ? 'bg-gradient-to-r from-white to-indigo-50/30 rounded-xl px-4 -mx-4 shadow-sm' : ''}`}
    >
      <button
        onClick={onToggle}
        className="w-full flex justify-between items-center text-left"
      >
        <span className={`text-lg font-medium ${isOpen ? 'text-indigo-900 font-semibold' : 'text-gray-800'} transition-all duration-300`}>
          {question}
        </span>
        <span className="ml-6 flex-shrink-0">
          {isOpen ? (
            <MinusIcon className="h-6 w-6 text-indigo-600" />
          ) : (
            <PlusIcon className="h-6 w-6 text-gray-400 group-hover:text-indigo-500 transition-colors duration-200" />
          )}
        </span>
      </button>

      <div
        className={`grid overflow-hidden transition-all duration-500 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] mt-5' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <p className="text-gray-600 leading-relaxed pb-2 font-normal">{answer}</p>
        </div>
      </div>
    </div>
  );
};

// --- Page Sections as Components ---

const HeroSection = ({ onApplyNowClick }) => (
  <section className="relative bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-32 pb-24 text-center overflow-hidden">
    {/* Background pattern */}
    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMzZjgzZjgiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMCAwdi02aC02djZoNnptNiAwaDZ2LTZoLTZ2NnptLTEyIDBoLTZ2LTZoNnY2em0tNiAwdi02aC02djZoNnptLTYgMGgtNnY2aDZ2LTZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] [mask-image:linear-gradient(to_bottom,white,transparent_80%)] opacity-90"></div>
    
    {/* Floating elements */}
    <div className="absolute w-96 h-96 -top-20 -left-20 bg-indigo-500/10 rounded-full blur-3xl"></div>
    <div className="absolute w-96 h-96 -bottom-20 -right-20 bg-purple-500/10 rounded-full blur-3xl"></div>
    
    <div className="relative max-w-5xl mx-auto px-6">
      <div className="inline-block mb-6 px-4 py-1.5 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full text-sm font-medium text-indigo-800 backdrop-blur-sm border border-indigo-100/30">
        <span className="animate-pulse inline-block w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
        Join our elite interviewer network
      </div>
      
      <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 leading-tight">
                Unlock Your Expertise.
                <br />
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Inspire the Nxt Wave.
                </span>
            </h1>
      
      <p className="mt-10 max-w-2xl mx-auto text-lg md:text-xl text-gray-600 leading-relaxed font-light">
        Join our exclusive network of professional interviewers. Earn competitively, work flexibly, and make a significant impact on the tech industry.
      </p>
      
      <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
        <button 
          onClick={onApplyNowClick} 
          className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-medium rounded-xl shadow-lg hover:shadow-indigo-500/25 hover:scale-[1.03] active:scale-[0.97] transition-all duration-300"
        >
          Apply Now
          <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </button>
        
        <button className="inline-flex items-center justify-center px-8 py-4 font-medium text-indigo-700 rounded-xl hover:bg-indigo-50/80 hover:shadow-sm active:bg-indigo-100/80 transition-all duration-200">
          <div className="flex items-center justify-center w-8 h-8 mr-3 bg-indigo-100 rounded-full text-indigo-600">
            <PlayIcon className="w-4 h-4" />
          </div>
          Watch How It Works
        </button>
      </div>
    </div>
  </section>
);

const BenefitsSection = () => {
    const benefits = [
        {
          icon: CurrencyRupeeIcon,
          title: 'Premium Earnings',
          description: 'Earn up to ₹1250 per interview with a transparent, tier-based payment system and swift payouts.',
        },
        {
          icon: ClockIcon,
          title: 'Ultimate Flexibility',
          description: 'Define your own schedule. Accept interviews that fit your life, from anywhere in the world.',
        },
        {
          icon: UserGroupIcon,
          title: 'Elite Professional Network',
          description: 'Connect with a curated network of 500+ top-tier tech professionals and industry leaders.',
        },
        {
          icon: ArrowTrendingUpIcon,
          title: 'Stay Sharp',
          description: 'Keep your technical and evaluation skills at the cutting edge by interacting with diverse talent.',
        },
        {
          icon: AcademicCapIcon,
          title: 'Impact & Mentor',
          description: 'Play a crucial role in identifying and nurturing the next generation of tech talent for top companies.',
        },
        {
          icon: ShieldCheckIcon,
          title: 'Seamless Experience',
          description: 'Our platform handles all the logistics—scheduling, payments, and support—so you can focus on interviewing.',
        },
    ];

    return (
        <section className="py-24 sm:py-22 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PHBhdGggZD0iTTIgMmg1NnY1NkgyVjJ6IiBmaWxsPSJub25lIiBzdHJva2U9IiNlMmU4ZjAiIHN0cm9rZS13aWR0aD0iMiIvPjwvc3ZnPg==')] opacity-40"></div>
            
            <div className="max-w-7xl mx-auto px-6 relative">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <div className="inline-block mb-4 px-4 py-1.5 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-full text-sm font-medium text-indigo-700">
                        For professionals like you
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">An Ecosystem Built for Professionals</h2>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {benefits.map((benefit, index) => (
                    <div 
                      key={index} 
                      className="p-8 bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 hover:shadow-2xl hover:shadow-indigo-100 hover:-translate-y-2 transition-all duration-300 group"
                    >
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform duration-300">
                            <benefit.icon className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-indigo-700 transition-colors duration-200">{benefit.title}</h3>
                        <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                    </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const HowItWorksSection = () => {
    // FIX: Added a 'description' field to each step object to fix the rendering error.
    const processSteps = [
      {
        icon: PencilSquareIcon,
        title: '1. Apply Online',
      },
      {
        icon: UserCircleIcon,
        title: '2. Profile Review',
      },
      {
        icon: AcademicCapIcon,
        title: '3. Assessment Phase',
      },
      {
        icon: RocketLaunchIcon,
        title: '4. Get Onboarded',
      },
      {
        icon: CurrencyRupeeIcon,
        title: '5. Start Earning',
      },
    ];
  
    return (
      <section className="py-24 sm:py-32 bg-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-100 via-indigo-500 to-purple-400"></div>
        <div className="absolute top-40 right-0 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-30 -z-10"></div>
        <div className="absolute bottom-40 left-0 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-30 -z-10"></div>
  
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <div className="inline-block mb-4 px-4 py-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-full text-sm font-medium text-indigo-700">
              A clear path to success
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">Your Journey to Becoming an Interviewer</h2>
            <p className="mt-6 text-lg text-gray-600">We’ve designed a streamlined and transparent process to get you from application to your first paid interview smoothly.</p>
          </div>
  
          <div className="relative">
            {/* The visual connector line for larger screens */}
            <div
              aria-hidden="true"
              className="hidden lg:block absolute top-10 left-1/2 -ml-[50%] h-0.5 w-full bg-gradient-to-r from-transparent via-indigo-200 to-transparent"
            ></div>
  
            <ol className="grid grid-cols-1 gap-y-16 lg:grid-cols-5 lg:gap-x-8">
              {processSteps.map((step, index) => (
                <li key={index} className="relative">
                  <div className="flex flex-col items-center text-center">
                    {/* The icon and its background circle */}
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white ring-4 ring-indigo-500 shadow-lg z-10">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
                        <step.icon className="h-8 w-8" />
                      </div>
                    </div>
                    {/* The step content */}
                    <div className="mt-6">
                      <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                      <p className="mt-3 text-base leading-relaxed text-gray-600">{step.description}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>
    );
};

const FaqSection = ({ onApplyNowClick }) => {
    // FIX: Initialized state to null to prevent auto-scrolling on page load.
    const [openFAQ, setOpenFAQ] = useState(null);
    
    const faqs = [
        {
          question: 'What are the minimum requirements to become an interviewer?',
          answer: 'You need at least 3 years of professional experience in your technical domain, strong communication skills, and a passion for mentoring. Your LinkedIn profile will be used for initial verification.'
        },
        {
          question: 'How and when do I get paid?',
          answer: 'Payments are processed weekly via direct bank transfer. You can track your earnings and upcoming payouts directly from your interviewer dashboard. We handle all invoicing automatically.'
        },
        {
          question: 'Do I need to prepare interview questions myself?',
          answer: 'While you have the autonomy to drive the interview, we provide a comprehensive question bank, coding challenges, and clear evaluation rubrics for various roles and domains to ensure consistency and quality.'
        },
        {
          question: 'What if I need to cancel or reschedule an interview?',
          answer: 'You can manage your schedule directly from the portal. We require a minimum of 2 hours notice for cancellations to ensure the candidate has a positive experience. Repeated last-minute cancellations may affect your rating.'
        }
    ];

    return (
        <section className="py-24 sm:py-32 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
            {/* Decorative blob */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-indigo-100/30 to-purple-100/20 blur-3xl opacity-60 -z-10"></div>
            
            <div className="max-w-4xl mx-auto px-6 relative">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <div className="inline-block mb-4 px-4 py-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-full text-sm font-medium text-indigo-700">
                        Got questions?
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">Frequently Asked Questions</h2>
                </div>
                
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    {faqs.map((faq, index) => (
                    <FAQItem
                        key={index}
                        question={faq.question}
                        answer={faq.answer}
                        isOpen={openFAQ === index}
                        onToggle={() => setOpenFAQ(openFAQ === index ? null : index)}
                    />
                    ))}
                </div>
                
            </div>
        </section>
    );
};

const HomePage = () => {
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Open modal if URL has #apply hash
    if (location.hash === '#apply') {
      setIsApplicationModalOpen(true);
      // Clean the URL so modal can be closed and re-opened via the link
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  const handleApplyNowClick = () => setIsApplicationModalOpen(true);
  const handleCloseModal = () => setIsApplicationModalOpen(false);
  
  return (
    <div className="bg-white font-['Inter',sans-serif] antialiased text-gray-900">
      <HeroSection onApplyNowClick={handleApplyNowClick} />
      <BenefitsSection />
      <HowItWorksSection />
      <FaqSection onApplyNowClick={handleApplyNowClick} /> 

      <Modal
        isOpen={isApplicationModalOpen}
        onClose={handleCloseModal}
        title="Apply to Become a NxtWave Interviewer"
        size="2xl"
      >
        <p className="text-gray-600 mb-6">
            Thank you for your interest. Please fill out the form below to start your application.
        </p>
        <InitialApplicationForm onSuccess={handleCloseModal} />
      </Modal>
    </div>
  );
};

export default HomePage;