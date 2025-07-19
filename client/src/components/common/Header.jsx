// client/src/components/common/Header.jsx
import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Header = ({ toggleSidebar }) => {
  const { currentUser: user } = useAuth(); // Adapt to currentUser
  const location = useLocation();

  // Simple title generator based on path
  const getPageTitle = () => {
    const path = location.pathname.split('/').pop();
    if (path === 'admin' || path === 'interviewer') return 'Dashboard';
    return path.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="text-gray-600 focus:outline-none lg:hidden mr-3"
          aria-label="Toggle sidebar"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-lg sm:text-xl font-semibold text-gray-800">{getPageTitle()}</h1>
      </div>

      <div className="flex items-center">
        <div className="flex items-center">
            <span className="text-sm text-gray-600 mr-2 hidden sm:inline">{user?.firstName || user?.email}</span>
            <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-semibold">
                {user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;