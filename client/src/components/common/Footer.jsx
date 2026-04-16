import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, ArrowRight } from 'lucide-react';
import logoSrc from '/logo.svg';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'Apply Now', path: '/applicationform' },
    { name: 'About Us', path: '/about' },
    { name: 'FAQ', path: '/faq' },
  ];

  const legalLinks = [
    { name: 'Privacy Policy', path: '/privacy-policy' },
    { name: 'Terms of Service', path: '/terms-of-service' },
    { name: 'Cookie Policy', path: '/cookie-policy' },
    { name: 'Contact Us', path: '/contact-us' },
  ];

  return (
    <footer className="bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand — logo kept as-is */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-4">
              <img src={logoSrc} alt="NxtWave" className="h-10 w-auto" />
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed max-w-sm mb-6">
              Empowering industry experts to shape the future of tech talent. Join our platform to conduct interviews, earn competitive pay, and make a lasting impact.
            </p>

            <div className="space-y-2.5 text-sm text-slate-500">
              <a href="mailto:interviewercommunity@nxtwave.in" className="flex items-center gap-3 hover:text-blue-600 transition-colors">
                <Mail size={16} className="text-slate-400" />
                interviewercommunity@nxtwave.in
              </a>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-slate-400" />
                +91 XXX XXX XXXX
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-slate-400" />
                Hyderabad, India
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-[11px] font-semibold text-slate-900 uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-sm text-slate-500 hover:text-blue-600 transition-colors inline-flex items-center gap-1.5 group"
                  >
                    <ArrowRight size={14} className="opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-[11px] font-semibold text-slate-900 uppercase tracking-wider mb-4">
              Legal
            </h3>
            <ul className="space-y-2.5">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-sm text-slate-500 hover:text-blue-600 transition-colors inline-flex items-center gap-1.5 group"
                  >
                    <ArrowRight size={14} className="opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-200" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-slate-400">
          &copy; {currentYear} NxtWave. All rights reserved.
        </p>
        <p className="text-xs text-slate-400">
          Built with care for the interviewer community.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
