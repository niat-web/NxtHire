import React from 'react';
import { useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname.split('/').pop();
    if (path === 'admin' || path === 'interviewer') return 'Dashboard';
    if (path === 'scheduled-interviews') return 'Your Scheduled Interviews';
    if (path === 'completed-interviews') return 'Completed Interviews';
    if (path === 'payment-details') return 'Payment Details';
    if (path === 'profile') return 'Your Profile';
    if (path === 'settings') return 'Account Settings';
    return path.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm h-14 flex items-center px-6">
      <h1 className="text-lg font-semibold text-gray-900">{getPageTitle()}</h1>
    </header>
  );
};

export default Header;
