// client/src/components/common/Navbar.jsx
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import nxtWaveLogo from '/logo.svg';

const Navbar = () => {
  const { currentUser } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getProfileLink = () => {
    if (!currentUser) return '/login';
    return currentUser.role === 'admin' ? '/admin/dashboard' : '/interviewer/dashboard';
  };

  // Updated navbar class to fix the white line issue at the bottom
  const navClass = isScrolled 
    ? "bg-slate-950/90 backdrop-blur-xl shadow-lg shadow-slate-900/30" 
    : "bg-transparent";

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${navClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex-shrink-0 flex items-center group">
            <div className="relative overflow-hidden">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <img className="h-10 sm:h-11 w-auto" src={nxtWaveLogo} alt="NxtWave Hire" />
              </motion.div>
              <motion.div 
                className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-purple-500 to-indigo-500"
                initial={{ width: 0 }}
                whileHover={{ width: "100%" }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </Link>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/about" 
              className="text-gray-300 hover:text-white transition-colors duration-300 text-sm font-medium"
            >
              About
            </Link>
            <Link 
              to="/faq" 
              className="text-gray-300 hover:text-white transition-colors duration-300 text-sm font-medium"
            >
              FAQ
            </Link>
            
            {currentUser ? (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Link 
                  to={getProfileLink()} 
                  className="flex items-center space-x-2 text-white bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300"
                >
                  <span className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 21V19C20 16.7909 18.2091 15 16 15H8C5.79086 15 4 16.7909 4 19V21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  <span>Dashboard</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
              </motion.div>
            ) : (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Link 
                  to="/#apply"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/#apply');
                  }}
                  className="relative inline-flex items-center justify-center overflow-hidden rounded-full py-3 px-7 text-sm font-medium text-white shadow-lg transition-all duration-300"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600"></span>
                  <span className="absolute inset-0 opacity-0 hover:opacity-100 bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 transition-opacity duration-300"></span>
                  <span className="relative flex items-center">
                    Apply Now
                    <svg className="ml-2 w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </Link>
              </motion.div>
            )}
          </div>
          
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className="p-2 rounded-lg text-gray-300 hover:text-white transition-colors"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              <span className="sr-only">{isMenuOpen ? "Close menu" : "Open menu"}</span>
              <div className="w-6 h-6 flex flex-col justify-center items-center relative">
                <span 
                  className={`block w-5 h-0.5 bg-current transform transition duration-300 ease-in-out ${
                    isMenuOpen ? "rotate-45 translate-y-0.5" : "translate-y-[-4px]"
                  }`}
                />
                <span 
                  className={`block w-5 h-0.5 bg-current transform transition duration-300 ease-in-out ${
                    isMenuOpen ? "opacity-0" : "opacity-100"
                  }`}
                />
                <span 
                  className={`block w-5 h-0.5 bg-current transform transition duration-300 ease-in-out ${
                    isMenuOpen ? "-rotate-45 -translate-y-0.5" : "translate-y-[4px]"
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </div>
      
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            className="md:hidden bg-slate-950/95 backdrop-blur-xl"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="px-4 py-6 space-y-5">
              <Link 
                to="/about" 
                onClick={() => setIsMenuOpen(false)} 
                className="block py-2 text-gray-300 hover:text-white transition-colors text-center"
              >
                About
              </Link>
              <Link 
                to="/faq" 
                onClick={() => setIsMenuOpen(false)} 
                className="block py-2 text-gray-300 hover:text-white transition-colors text-center"
              >
                FAQ
              </Link>
              {currentUser ? (
                <Link 
                  to={getProfileLink()} 
                  onClick={() => setIsMenuOpen(false)} 
                  className="block text-center py-3 px-4 rounded-lg text-white font-medium bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <Link 
                  to="/#apply" 
                  onClick={() => {
                    setIsMenuOpen(false);
                    navigate('/#apply');
                  }} 
                  className="block text-center py-3 px-4 rounded-lg text-white font-medium bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all"
                >
                  Apply Now
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
