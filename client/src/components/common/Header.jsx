import React from 'react';
import { useLocation } from 'react-router-dom';

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
    <header className="bg-card border-b border-border h-14 flex items-center justify-between px-6 lg:px-10 shrink-0">
      <div className="flex items-center gap-3">
        {eyebrow && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-[2px]" style={{ backgroundColor: 'var(--brave-amber)' }} />
            {eyebrow}
          </span>
        )}
        <h1 className="font-display text-[18px] font-bold text-foreground tracking-tight leading-none">
          {getPageTitle()}
        </h1>
      </div>
    </header>
  );
};

export default Header;
