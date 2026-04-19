import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';
import logoSrc from '/logo.svg';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'Apply now', path: '/applicationform' },
    { name: 'About', path: '/about' },
    { name: 'FAQ', path: '/faq' },
  ];

  const legalLinks = [
    { name: 'Privacy policy', path: '/privacy-policy' },
    { name: 'Terms of service', path: '/terms-of-service' },
    { name: 'Cookie policy', path: '/cookie-policy' },
    { name: 'Contact us', path: '/contact-us' },
  ];

  return (
    <footer className="bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-10 lg:py-12">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-x-8 gap-y-10">
          {/* Brand + tagline */}
          <div className="col-span-2 md:col-span-4">
            <Link to="/" className="inline-flex items-center" aria-label="NxtHire home">
              <img src={logoSrc} alt="NxtHire" className="h-7 w-auto" />
            </Link>
            <p className="mt-4 text-[13.5px] text-slate-600 leading-relaxed max-w-sm">
              Empowering industry experts to shape the future of tech talent.
            </p>
          </div>

          {/* Navigate */}
          <div className="md:col-span-2 md:col-start-6">
            <h4 className="text-[10.5px] font-semibold text-slate-500 uppercase tracking-[0.2em] mb-4">
              Navigate
            </h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-[13.5px] text-slate-700 hover:text-[#FF4800] transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="md:col-span-2">
            <h4 className="text-[10.5px] font-semibold text-slate-500 uppercase tracking-[0.2em] mb-4">
              Legal
            </h4>
            <ul className="space-y-2.5">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-[13.5px] text-slate-700 hover:text-[#FF4800] transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-3">
            <h4 className="text-[10.5px] font-semibold text-slate-500 uppercase tracking-[0.2em] mb-4">
              Contact
            </h4>
            <ul className="space-y-2.5 text-[13.5px] text-slate-700">
              <li>
                <a href="mailto:interviewercommunity@nxtwave.in" className="inline-flex items-center gap-2 hover:text-[#FF4800] transition-colors">
                  <Mail className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                  interviewercommunity@nxtwave.in
                </a>
              </li>
              <li className="inline-flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                +91 XXX XXX XXXX
              </li>
              <li className="inline-flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                Hyderabad, India
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Colophon */}
      <div className="border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[11.5px] text-slate-500">
            &copy; {currentYear} NxtWave — all rights reserved.
          </p>
          <p className="text-[11.5px] text-slate-500 italic">
            Built with care for the interviewer community.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
