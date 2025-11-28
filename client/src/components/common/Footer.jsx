// client/src/components/common/Footer.jsx
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Mail,
  MapPin,
  Phone,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  ArrowRight,
  Heart,
  Rocket
} from 'lucide-react';
import logoSrc from '/logo.svg';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { name: 'Twitter', icon: Twitter, href: '#', color: 'hover:bg-blue-400' },
    { name: 'LinkedIn', icon: Linkedin, href: '#', color: 'hover:bg-blue-600' },
    { name: 'Facebook', icon: Facebook, href: '#', color: 'hover:bg-blue-500' },
    { name: 'Instagram', icon: Instagram, href: '#', color: 'hover:bg-pink-500' },
  ];

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
    <footer className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white border-t border-orange-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-6 group">
              <motion.img
                src={logoSrc}
                alt="NxtWave Logo"
                className="h-12 w-auto"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              />
              <motion.div
                className="h-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full mt-2"
                initial={{ width: 0 }}
                whileHover={{ width: "100%" }}
                transition={{ duration: 0.3 }}
              />
            </Link>

            <p className="text-slate-400 mb-6 max-w-md leading-relaxed">
              Empowering industry experts to <span className="text-orange-400 font-semibold">shape the future</span> of tech talent.
              Join our platform to conduct interviews, earn competitive compensation, and make a lasting impact.
            </p>

            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-slate-400 hover:text-orange-400 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Mail size={18} className="text-orange-400" />
                </div>
                <span>interviewercommunity@nxtwave.in</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400 hover:text-teal-400 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center">
                  <Phone size={18} className="text-teal-400" />
                </div>
                <span>+91 XXX XXX XXXX</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400 hover:text-cyan-400 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                  <MapPin size={18} className="text-cyan-400" />
                </div>
                <span>Hyderabad, India</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  className={`w-11 h-11 rounded-xl bg-slate-800/50 flex items-center justify-center text-slate-400 ${social.color} hover:text-white transition-all border border-slate-700 hover:border-transparent`}
                  aria-label={social.name}
                  whileHover={{ scale: 1.1, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <social.icon size={20} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-orange-400 to-amber-400 rounded-full" />
              Quick Links
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-slate-400 hover:text-orange-400 transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                    <span>{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-teal-400 to-cyan-400 rounded-full" />
              Legal
            </h3>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-slate-400 hover:text-teal-400 transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                    <span>{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-teal-500" />
    </footer>
  );
};

export default Footer;
