import React from 'react';
import { useLocation } from 'react-router-dom';

const ACCENT = '#FF4800';
const DISPLAY = { fontFamily: 'Fraunces, Georgia, serif' };

const Header = () => {
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname.split('/').pop();
    if (path === 'admin' || path === 'interviewer') return 'Dashboard';
    if (path === 'scheduled-interviews') return 'Scheduled interviews';
    if (path === 'completed-interviews') return 'Completed interviews';
    if (path === 'payment-details') return 'Payment details';
    if (path === 'profile') return 'Profile';
    if (path === 'settings') return 'Settings';
    return path.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getEyebrow = () => {
    if (location.pathname.startsWith('/admin')) return 'Admin';
    if (location.pathname.startsWith('/interviewer')) return 'Interviewer';
    return null;
  };

  const eyebrow = getEyebrow();

  return (
    <header className="bg-white border-b border-slate-200 h-14 flex items-center justify-between px-6 lg:px-10 shrink-0">
      <div className="flex items-center gap-3">
        {eyebrow && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: ACCENT }} />
            {eyebrow}
          </span>
        )}
        <h1 style={DISPLAY} className="text-[18px] font-semibold text-slate-900 tracking-tight leading-none">{getPageTitle()}</h1>
      </div>
    </header>
  );
};

export default Header;
