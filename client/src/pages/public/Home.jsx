// client/src/pages/public/Home.jsx
import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useInView, useScroll, useTransform } from 'framer-motion';
import Modal from '../../components/common/Modal';
import InitialApplicationForm from '../../components/forms/InitialApplicationForm';

// Animated background component
const AnimatedBackground = () => {
  return (
    <div className="animated-background">
      {[...Array(20)].map((_, i) => (
        <div 
          key={i} 
          className="particle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            width: `${Math.random() * 300 + 50}px`,
            height: `${Math.random() * 300 + 50}px`,
          }}
        />
      ))}
    </div>
  );
};

// Animated text with sequential letter reveal
const AnimatedText = ({ text, className = "", once = true, delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once });
  
  const letters = Array.from(text);
  
  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.03, delayChildren: delay * i },
    }),
  };
  
  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  };
  
  return (
    <motion.span
      ref={ref}
      className={`inline-block ${className}`}
      variants={container}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      {letters.map((letter, index) => (
        <motion.span
          key={index}
          variants={child}
          className="inline-block"
        >
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}
    </motion.span>
  );
};

// Custom button with animated hover effect
const AnimatedButton = ({ children, onClick, primary = false, className = "" }) => {
  const buttonRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const baseClass = primary 
    ? "relative overflow-hidden rounded-full px-6 py-3 text-white font-medium transition-all duration-300 ease-out"
    : "relative overflow-hidden rounded-full border border-white/20 px-6 py-3 text-white font-medium transition-all duration-300 ease-out";

  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setIsHovered(false)}
      className={`${baseClass} ${className}`}
    >
      <span className="relative z-10">{children}</span>
      {isHovered && (
        <motion.span
          className={`absolute inset-0 ${primary ? 'bg-white/20' : 'bg-white/10'}`}
          style={{
            left: position.x,
            top: position.y,
            transform: 'translate(-50%, -50%)',
            width: '150%',
            height: '150%',
            borderRadius: '50%',
          }}
          initial={{ scale: 0, opacity: 0.8 }}
          animate={{ scale: 2.5, opacity: 0 }}
          transition={{ duration: 0.8 }}
        />
      )}
      {primary && (
        <span className="absolute inset-0 bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-700 -z-10"></span>
      )}
    </button>
  );
};

// Company logo component
const CompanyLogo = ({ name }) => {
  const variants = {
    initial: { opacity: 0.3, filter: "grayscale(1)" },
    hover: { 
      opacity: 1, 
      filter: "grayscale(0)",
      scale: 1.05,
      transition: { duration: 0.3 } 
    }
  };

  return (
    <motion.div
      className="flex items-center justify-center"
      initial="initial"
      whileHover="hover"
      variants={variants}
    >
      <img
        src={`https://img.shields.io/badge/${name}-grey?style=for-the-badge&logo=${name.toLowerCase().replace(' ', '')}`}
        alt={name}
        className="max-h-8 w-full object-contain"
      />
    </motion.div>
  );
};

// 3D floating card component
const FloatingCard = ({ children, delay = 0, className = "" }) => {
  const cardRef = useRef(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;
    
    setRotateX(rotateX);
    setRotateY(rotateY);
  };

  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: delay * 0.2 }}
      className={className}
    >
      <motion.div
        ref={cardRef}
        className="h-full rounded-3xl p-1"
        style={{
          background: "linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
          transformStyle: "preserve-3d",
          transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${isHovered ? 1.02 : 1})`,
          transition: "transform 0.1s ease",
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setRotateX(0);
          setRotateY(0);
        }}
      >
        <div 
          className="h-full rounded-[22px] p-6 bg-slate-950/95 backdrop-blur-sm border border-white/5"
          style={{
            transformStyle: "preserve-3d",
          }}
        >
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
};

// Scrolling stats component
const ScrollingStats = () => {
  const stats = [
    { number: "500+", label: "Industry Experts" },
    { number: "24/7", label: "Flexibility" },
    { number: "10,000+", label: "Interviews Conducted" },
    { number: "97%", label: "Satisfaction Rate" },
  ];

  return (
    <div className="relative py-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-transparent to-slate-950 z-10 pointer-events-none"/>
      <div className="flex space-x-16 animate-scroll">
        {[...stats, ...stats].map((stat, index) => (
          <div key={index} className="flex flex-col items-center min-w-[160px]">
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              {stat.number}
            </div>
            <div className="text-sm text-slate-400">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Updated Hero Section with fixed background
const HeroSection = ({ onApplyNowClick }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });
  
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 100]);
  
  return (
    <>
      {/* Fixed Background */}
      <div className="fixed inset-0 bg-gray-900/95 -z-20" /> 
      <div className="fixed inset-0 bg-gradient-to-b from-slate-800/60 to-slate-900/60 -z-10" />
      <div className="fixed inset-0 z-0">
        <AnimatedBackground />
      </div>

      <motion.section 
        ref={ref}
        style={{ opacity, scale, y }}
        className="relative min-h-screen flex items-center justify-center pt-20 pb-40 overflow-hidden"
      >
        <div className="container max-w-6xl mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-3"
            >
              <span className="inline-block py-1 px-3 text-xs font-medium text-indigo-200 bg-indigo-900/30 rounded-full backdrop-blur-sm">
                NxtWave Interviewer Platform
              </span>
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6">
              <AnimatedText text="For " />
              <AnimatedText 
                text="Industry Experts" 
                className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent"
                delay={0.5}
              />
              <br/>
              <AnimatedText 
                text="Shaping Tomorrow's" 
                delay={1}
              />
              <br/>
              <AnimatedText 
                text="Tech Talent" 
                className="bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent"
                delay={1.5}
              />
            </h1>
            
            <motion.p 
              className="text-xl text-slate-300 mb-10 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2, duration: 1 }}
            >
              Leverage your expertise to mentor aspiring developers, earn competitive compensation, 
              and enjoy unparalleled flexibility. Join an elite network dedicated to identifying the 
              <span className="text-cyan-400 font-medium"> nxtwave of talent</span>.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.2, duration: 0.8 }}
            >
              <AnimatedButton 
                onClick={onApplyNowClick} 
                primary 
                className="group text-lg shadow-lg shadow-purple-900/20 hover:shadow-purple-700/30"
              >
                <span className="flex items-center gap-2">
                  Apply to Join Us
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14m-7-7l7 7-7 7" />
                    </svg>
                  </motion.span>
                </span>
              </AnimatedButton>
              
              <AnimatedButton className="text-lg">
                Learn More
              </AnimatedButton>
            </motion.div>
          </div>
        </div>
        
        <motion.div 
          className="absolute bottom-10 left-0 right-0 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3, duration: 1 }}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-slate-400">
              <path d="M12 5v14M5 12l7 7 7-7"/>
            </svg>
          </motion.div>
          <p className="text-sm text-slate-400 mt-2">Scroll to discover more</p>
        </motion.div>
      </motion.section>
      
      {/* Clear fixed background for the rest of the content */}
      <div className="relative z-10 bg-slate-950">
        <CompaniesSection />
        <BenefitsSection />
        <CTASection />
      </div>
    </>
  );
};

const CompaniesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  
  const companies = [
    'Dell', 'GitLab', 'Google', 'GitHub', 'IBM', 
    'MicroStrategy', 'aws', 'verizon', 'ebay', 'Shell'
  ];
  
  return (
    <section ref={ref} className="py-20 bg-gradient-to-b from-slate-950 to-slate-900">
      <div className="container max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block py-1 px-3 text-xs font-medium text-indigo-200 bg-indigo-900/30 rounded-full backdrop-blur-sm mb-3">
            Industry Recognition
          </span>
          <h2 className="text-3xl font-bold text-white mb-4">From Tech Leaders to Tech Mentors</h2>
          <p className="text-slate-300 max-w-2xl mx-auto">
            Our interviewers are seasoned professionals from leading tech companies,
            bringing real-world insights to identify and nurture top talent.
          </p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {companies.map((company, index) => (
            <CompanyLogo key={company} name={company} />
          ))}
        </motion.div>
      </div>
      
      <ScrollingStats />
    </section>
  );
};

const BenefitsSection = () => {
  const benefits = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="12" x="2" y="6" rx="2" />
          <circle cx="12" cy="12" r="2" />
          <path d="M6 12h.01M18 12h.01" />
        </svg>
      ),
      title: "Competitive Compensation",
      description: "Earn up to ₹1250 per interview with a transparent, tier-based payment system. Your expertise is valued and rewarded properly.",
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
      title: "Unmatched Flexibility",
      description: "Define your own schedule. Accept interviews that fit your life, not the other way around. Work from anywhere, anytime.",
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      title: "Elite Professional Network",
      description: "Join and connect with a curated community of over 500+ top-tier tech professionals and industry leaders.",
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      ),
      title: "Growth Opportunities",
      description: "Sharpen your evaluation skills, stay current with industry trends, and contribute to the future of tech talent development.",
    }
  ];

  return (
    <section className="py-32 bg-gradient-to-b from-slate-900 to-slate-950">
      <div className="container max-w-6xl mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center mb-20">
          <span className="inline-block py-1 px-3 text-xs font-medium text-indigo-200 bg-indigo-900/30 rounded-full backdrop-blur-sm mb-3">
            Why Join Us?
          </span>
          <h2 className="text-4xl font-bold text-white mb-4">
            A Platform Designed for Your Expertise
          </h2>
          <p className="text-slate-300">
            We handle the logistics so you can focus on what you do best: identifying exceptional talent and making a lasting impact.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {benefits.map((benefit, index) => (
            <FloatingCard key={index} delay={index} className="h-full">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white mb-6">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{benefit.title}</h3>
                <p className="text-slate-400 flex-grow">{benefit.description}</p>
                
                <motion.div 
                  className="mt-6 text-indigo-400 flex items-center gap-2 font-medium cursor-pointer"
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  Learn more 
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14m-7-7l7 7-7 7" />
                  </svg>
                </motion.div>
              </div>
            </FloatingCard>
          ))}
        </div>
      </div>
    </section>
  );
};

const CTASection = ({ onApplyNowClick }) => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-indigo-900/20" />
      <div className="absolute inset-0">
        <div className="h-full w-full" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(120, 80, 255, 0.1) 0%, rgba(13, 16, 45, 0) 70%)' }} />
      </div>
      
      <div className="container max-w-5xl mx-auto px-6 relative z-10">
        <div className="bg-gradient-to-r from-slate-900/95 to-slate-800/95 backdrop-blur-sm rounded-3xl p-1">
          <div className="bg-gradient-to-r from-slate-950 to-slate-900 rounded-[22px] p-12 border border-white/5">
            <div className="text-center max-w-3xl mx-auto">
              <span className="inline-block py-1 px-3 text-xs font-medium text-indigo-200 bg-indigo-900/30 rounded-full backdrop-blur-sm mb-3">
                Ready to Join?
              </span>
              <h2 className="text-4xl font-bold text-white mb-6">
                Become a part of shaping the future of tech talent
              </h2>
              <p className="text-slate-300 mb-10">
                Apply today to join our elite network of tech interviewers. Your expertise deserves a platform that values it.
              </p>
              
              <AnimatedButton 
                onClick={onApplyNowClick} 
                primary 
                className="text-lg shadow-lg shadow-purple-900/20 hover:shadow-purple-700/30 mx-auto"
              >
                <span className="flex items-center gap-2">
                  Apply to Join Us
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14m-7-7l7 7-7 7" />
                  </svg>
                </span>
              </AnimatedButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Main Home Page Component
const Home = () => {
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.hash === '#apply') {
      setIsApplicationModalOpen(true);
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  const handleApplyNowClick = () => setIsApplicationModalOpen(true);
  const handleCloseModal = () => setIsApplicationModalOpen(false);
  
  return (
    <div className="text-slate-200 font-sans antialiased">      
      <main>
        <HeroSection onApplyNowClick={handleApplyNowClick} />
      </main>
      
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
      
      {/* Global styles */}
      <style jsx global>{`
        .animated-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          z-index: 0;
        }
        
        .particle {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle at center, rgba(139, 92, 246, 0.15), rgba(30, 64, 175, 0.05));
          animation: float 15s infinite ease-in-out;
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          25% {
            transform: translateY(-30px) translateX(30px);
          }
          50% {
            transform: translateY(-15px) translateX(-20px);
          }
          75% {
            transform: translateY(30px) translateX(20px);
          }
        }
        
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-160px * 5 - 4rem));
          }
        }
        
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
          /* Custom scrollbar styling */
  ::-webkit-scrollbar {
    width: 6px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(138, 143, 184, 0.4);
    border-radius: 10px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: rgba(138, 143, 184, 0.6);
  }

  /* Firefox */
  * {
    scrollbar-width: thin;
    scrollbar-color: rgba(138, 143, 184, 0.4) transparent;
  }
      `}</style>
    </div>
  );
};

export default Home;
