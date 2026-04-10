import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, User, Home, HelpCircle, Info } from 'lucide-react';
import nxtWaveLogo from '/logo.svg';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  const { currentUser } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getProfileLink = () => {
    if (!currentUser) return '/login';
    return currentUser.role === 'admin' ? '/admin/dashboard' : '/interviewer/dashboard';
  };

  const navLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/about', label: 'About', icon: Info },
    { to: '/faq', label: 'FAQ', icon: HelpCircle },
  ];

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-gray-100'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-18">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <img className="h-9 sm:h-10 w-auto" src={nxtWaveLogo} alt="NxtWave" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                {link.label}
              </Link>
            ))}

            <div className="ml-4 flex items-center gap-3">
              {currentUser ? (
                <Button
                  variant="success"
                  className="rounded-xl"
                  onClick={() => navigate(getProfileLink())}
                >
                  <User size={16} className="mr-2" />
                  Dashboard
                </Button>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Button
                    variant="success"
                    className="rounded-xl shadow-md"
                    onClick={() => navigate('/applicationform')}
                  >
                    Apply Now
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Mobile toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-600 hover:text-indigo-600 hover:bg-indigo-50"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="md:hidden bg-white border-t border-gray-100 shadow-md"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 py-2.5 px-4 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors text-sm font-medium"
                >
                  <link.icon size={18} />
                  {link.label}
                </Link>
              ))}

              <div className="pt-3 mt-3 border-t border-gray-100 space-y-2">
                {currentUser ? (
                  <Button
                    variant="success"
                    className="w-full rounded-xl"
                    onClick={() => { setIsMenuOpen(false); navigate(getProfileLink()); }}
                  >
                    <User size={18} className="mr-2" />
                    Go to Dashboard
                  </Button>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="block text-center py-3 rounded-xl text-gray-700 font-medium border border-gray-200 hover:bg-gray-50 transition-colors text-sm"
                    >
                      Sign In
                    </Link>
                    <Button
                      variant="success"
                      className="w-full rounded-xl"
                      onClick={() => { setIsMenuOpen(false); navigate('/applicationform'); }}
                    >
                      Apply Now
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
