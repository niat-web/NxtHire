// client/src/components/common/Footer.jsx
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import logoSrc from '/logo.svg';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { name: 'twitter', icon: 'M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z' },
    { name: 'linkedin', icon: 'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zm4-5a2 2 0 11-4 0 2 2 0 014 0z' },
    { name: 'facebook', icon: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z' },
    { name: 'instagram', icon: 'M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 011.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 01-1.153 1.772 4.915 4.915 0 01-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 01-1.772-1.153 4.904 4.904 0 01-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 011.153-1.772A4.897 4.897 0 015.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2z' },
  ];

  return (
    <footer className="bg-slate-950 text-white border-t border-indigo-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="mb-6 inline-block">
              <motion.img 
                src={logoSrc} 
                alt="NxtWave Logo" 
                className="h-12 w-auto" 
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              />
            </Link>
            <p className="text-slate-400 mb-6 max-w-md">
              Connecting skilled professionals with opportunities to conduct interviews and earn competitive compensation while helping shape the next generation of tech talent.
            </p>
            
            <div className="flex space-x-4 mb-6">
              {socialLinks.map((link) => (
                <motion.a
                  key={link.name}
                  href="#"
                  className="w-10 h-10 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white transition-all"
                  aria-label={link.name}
                  whileHover={{ scale: 1.1, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path d={link.icon} />
                  </svg>
                </motion.a>
              ))}
            </div>
            
            
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">Quick Links</h3>
            <ul className="space-y-3">
              {['Home', 'Apply Now', 'About Us', 'FAQ'].map((link) => (
                <li key={link}>
                  <Link 
                    to={link === 'Apply Now' ? '/#apply' : `/${link.toLowerCase().replace(/\s+/g, '-')}`} 
                    className="text-slate-400 hover:text-indigo-400 transition-colors duration-200 flex items-center"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mr-2">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">Legal</h3>
            <ul className="space-y-3">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Contact Us'].map((link) => (
                <li key={link}>
                  <Link 
                    to={`/${link.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-slate-400 hover:text-indigo-400 transition-colors duration-200 flex items-center"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mr-2">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
