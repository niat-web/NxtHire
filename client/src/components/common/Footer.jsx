import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, ArrowUpRight } from 'lucide-react';
import logoSrc from '/logo.svg';

const ACCENT = '#FF4800';
const DISPLAY = { fontFamily: 'Fraunces, Georgia, serif' };

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
      {/* Masthead callout */}
      <div className="border-b border-slate-200 bg-[#FBFAF7]">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-14 lg:py-16">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.2em] text-slate-600">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: ACCENT }} />
                Become an interviewer
              </span>
              <h3 style={DISPLAY} className="mt-5 text-[34px] sm:text-[40px] font-semibold text-slate-900 tracking-tight leading-[1.08]">
                Interview work, <em className="italic" style={{ color: ACCENT }}>considered</em>.
              </h3>
              <p className="mt-3 text-[14.5px] text-slate-600 leading-relaxed">
                Join NxtWave's community of senior engineers conducting structured, paid interviews — on your own schedule.
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Link
                to="/applicationform"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-slate-900 px-6 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-[#FF4800]"
              >
                Apply now <ArrowUpRight size={14} />
              </Link>
              <Link
                to="/faq"
                className="inline-flex h-11 items-center rounded-full border border-slate-900 px-5 text-[12.5px] font-semibold text-slate-900 transition-colors hover:bg-slate-900 hover:text-white"
              >
                Read FAQ
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer grid */}
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-14">
          <div className="md:col-span-5">
            <Link to="/" className="inline-flex items-center mb-6" aria-label="NxtHire home">
              <img src={logoSrc} alt="NxtHire" className="h-8 w-auto" />
            </Link>
            <p className="text-slate-600 text-[14.5px] leading-relaxed max-w-md mb-8">
              Empowering industry experts to shape the future of tech talent. Conduct interviews, earn competitively, and make a lasting impact.
            </p>

            <div className="space-y-3 text-[13.5px] text-slate-600">
              <a href="mailto:interviewercommunity@nxtwave.in" className="flex items-center gap-3 hover:text-slate-900 transition-colors group">
                <span className="h-8 w-8 rounded-full border border-slate-200 bg-white inline-flex items-center justify-center text-slate-500 group-hover:border-slate-900 group-hover:text-slate-900 transition-colors">
                  <Mail size={13} />
                </span>
                interviewercommunity@nxtwave.in
              </a>
              <div className="flex items-center gap-3">
                <span className="h-8 w-8 rounded-full border border-slate-200 bg-white inline-flex items-center justify-center text-slate-500">
                  <Phone size={13} />
                </span>
                +91 XXX XXX XXXX
              </div>
              <div className="flex items-center gap-3">
                <span className="h-8 w-8 rounded-full border border-slate-200 bg-white inline-flex items-center justify-center text-slate-500">
                  <MapPin size={13} />
                </span>
                Hyderabad, India
              </div>
            </div>
          </div>

          <div className="md:col-span-3 md:col-start-7">
            <h4 className="text-[10.5px] font-semibold text-slate-500 uppercase tracking-[0.2em] mb-5">
              Navigate
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-[14px] text-slate-700 hover:text-[#FF4800] transition-colors inline-flex items-center gap-1.5 group"
                  >
                    <span>{link.name}</span>
                    <ArrowUpRight size={12} className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3">
            <h4 className="text-[10.5px] font-semibold text-slate-500 uppercase tracking-[0.2em] mb-5">
              Legal
            </h4>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-[14px] text-slate-700 hover:text-[#FF4800] transition-colors inline-flex items-center gap-1.5 group"
                  >
                    <span>{link.name}</span>
                    <ArrowUpRight size={12} className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar — colophon */}
      <div className="border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-[11.5px] text-slate-500">
            <span>&copy; {currentYear} NxtWave.</span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span>All rights reserved.</span>
          </div>
          <p className="text-[11.5px] text-slate-500 italic">
            Built with care for the interviewer community.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
