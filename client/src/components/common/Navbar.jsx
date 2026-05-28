import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, User, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const BraveWordmark = ({ className = '' }) => (
  <span className={cn('flex items-baseline gap-1 select-none', className)}>
    <span className="font-display text-[22px] sm:text-[24px] font-extrabold tracking-tight text-primary leading-none">
      NXTHIRE
    </span>
    <span
      className="inline-block h-2 w-2 rounded-[2px]"
      style={{ backgroundColor: 'var(--brave-amber)' }}
      aria-hidden="true"
    />
  </span>
);

const Navbar = () => {
  const { currentUser } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getProfileLink = () => {
    if (!currentUser) return '/login';
    return currentUser.role === 'admin' ? '/admin/dashboard' : '/interviewer/dashboard';
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About' },
    { to: '/faq', label: 'FAQ' },
  ];

  const isActive = (to) => to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-colors duration-200',
        isScrolled
          ? 'bg-background/90 backdrop-blur border-b border-border'
          : 'bg-background border-b border-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Wordmark */}
          <Link to="/" className="flex items-center flex-shrink-0 group" aria-label="NxtHire home">
            <BraveWordmark className="transition-opacity group-hover:opacity-80" />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    'relative inline-flex items-center px-3.5 h-9 text-[13px] font-medium transition-colors',
                    active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {link.label}
                  {active && (
                    <span
                      className="absolute left-1/2 -translate-x-1/2 bottom-1 h-1 w-1 rounded-full"
                      style={{ backgroundColor: 'var(--brave-amber)' }}
                    />
                  )}
                </Link>
              );
            })}

            <div className="ml-4 flex items-center gap-2">
              {currentUser ? (
                <button
                  onClick={() => navigate(getProfileLink())}
                  className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-5 text-[13px] font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                >
                  <User size={14} />
                  Dashboard
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="inline-flex h-10 items-center rounded-md border border-primary px-4 text-[12.5px] font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                  >
                    Sign in
                  </Link>
                  <button
                    onClick={() => navigate('/applicationform')}
                    className="inline-flex h-10 items-center gap-1.5 rounded-md bg-primary px-5 text-[13px] font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                  >
                    Apply now <ArrowRight size={13} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden h-10 w-10 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="md:hidden bg-background border-t border-border"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-5 py-4 space-y-0.5">
              {navLinks.map((link) => {
                const active = isActive(link.to);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 py-2.5 px-3 rounded-md transition-colors text-[14px]',
                      active ? 'text-foreground bg-muted font-semibold' : 'text-muted-foreground hover:text-foreground hover:bg-muted font-medium'
                    )}
                  >
                    {active && <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: 'var(--brave-amber)' }} />}
                    {link.label}
                  </Link>
                );
              })}

              <div className="pt-3 mt-3 border-t border-border space-y-2">
                {currentUser ? (
                  <button
                    onClick={() => { setIsMenuOpen(false); navigate(getProfileLink()); }}
                    className="w-full inline-flex items-center justify-center gap-2 h-10 text-[13px] font-semibold text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors"
                  >
                    <User size={16} />
                    Go to dashboard
                  </button>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="block text-center h-10 leading-10 rounded-md text-primary text-[13px] font-semibold border border-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      Sign in
                    </Link>
                    <button
                      onClick={() => { setIsMenuOpen(false); navigate('/applicationform'); }}
                      className="w-full h-10 text-[13px] font-semibold text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors"
                    >
                      Apply now
                    </button>
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
