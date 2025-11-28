// client/src/components/common/Navbar.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Rocket, User, Home, HelpCircle, Info } from 'lucide-react';
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

  const navClass = isScrolled
    ? "bg-slate-900/95 backdrop-blur-xl shadow-lg border-b border-orange-500/20"
    : "bg-transparent";

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="relative"
            >
              <img className="h-11 sm:h-12 w-auto" src={nxtWaveLogo} alt="NxtWave" />
              <motion.div
                className="absolute -bottom-1 left-0 h-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
                initial={{ width: 0 }}
                whileHover={{ width: "100%" }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-slate-300 hover:text-orange-400 transition-colors duration-200 text-sm font-semibold flex items-center gap-2"
            >
              <Home size={16} />
              Home
            </Link>
            <Link
              to="/about"
              className="text-slate-300 hover:text-teal-400 transition-colors duration-200 text-sm font-semibold flex items-center gap-2"
            >
              <Info size={16} />
              About
            </Link>
            <Link
              to="/faq"
              className="text-slate-300 hover:text-cyan-400 transition-colors duration-200 text-sm font-semibold flex items-center gap-2"
            >
              <HelpCircle size={16} />
              FAQ
            </Link>

            {currentUser ? (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to={getProfileLink()}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all shadow-lg shadow-teal-500/30"
                >
                  <User size={18} />
                  Dashboard
                </Link>
              </motion.div>
            ) : (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/applicationform"
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/40"
                >
                  <Rocket size={18} />
                  Apply Now
                </Link>
              </motion.div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-orange-400 transition-colors"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="md:hidden bg-slate-900/98 backdrop-blur-xl border-t border-orange-500/20"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-4 py-6 space-y-4">
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 py-3 px-4 text-slate-300 hover:text-orange-400 hover:bg-orange-500/10 rounded-lg transition-all"
              >
                <Home size={20} />
                <span className="font-semibold">Home</span>
              </Link>
              <Link
                to="/about"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 py-3 px-4 text-slate-300 hover:text-teal-400 hover:bg-teal-500/10 rounded-lg transition-all"
              >
                <Info size={20} />
                <span className="font-semibold">About</span>
              </Link>
              <Link
                to="/faq"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 py-3 px-4 text-slate-300 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all"
              >
                <HelpCircle size={20} />
                <span className="font-semibold">FAQ</span>
              </Link>

              {currentUser ? (
                <Link
                  to={getProfileLink()}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-center gap-2 py-4 rounded-xl text-white font-bold bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 transition-all shadow-lg"
                >
                  <User size={20} />
                  Go to Dashboard
                </Link>
              ) : (
                <Link
                  to="/applicationform"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-center gap-2 py-4 rounded-xl text-white font-bold bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg"
                >
                  <Rocket size={20} />
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
