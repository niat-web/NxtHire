// client/src/components/common/Header.jsx
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { motion } from 'framer-motion';

const Header = ({ toggleSidebar }) => {
  const { currentUser: user } = useAuth();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);

  // Improved title generator with more friendly names
  const getPageTitle = () => {
    const path = location.pathname.split('/').pop();
    
    // Handle special cases
    if (path === 'admin' || path === 'interviewer') return 'Dashboard';
    if (path === 'scheduled-interviews') return 'Your Scheduled Interviews';
    if (path === 'completed-interviews') return 'Completed Interviews';
    if (path === 'profile') return 'Your Profile';
    if (path === 'settings') return 'Account Settings';
    
    // Default formatting
    return path.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 h-16 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleSidebar}
          className="text-gray-700 focus:outline-none lg:hidden mr-3"
          aria-label="Toggle sidebar"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </motion.button>
        
        <h1 className="text-lg sm:text-xl font-semibold text-gray-800">
          <span className="hidden sm:inline">{getPageTitle()}</span>
          <span className="sm:hidden">
            {getPageTitle().length > 15 ? getPageTitle().substring(0, 15) + '...' : getPageTitle()}
          </span>
        </h1>
      </div>

      <div className="flex items-center">
        <div className="mr-4 relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-gray-600 hover:text-gray-800 focus:outline-none"
            aria-label="Notifications"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-500 rounded-full">
              3
            </span>
          </motion.button>
        </div>
        
        <div className="relative">
          <motion.div 
            className="flex items-center cursor-pointer"
            onClick={() => setShowDropdown(!showDropdown)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-sm text-gray-700 mr-2 hidden sm:inline font-medium">
              {user?.firstName || user?.email}
            </span>
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-sm font-semibold shadow-md">
              {user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
            </div>
            <svg className="ml-1 h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </motion.div>
          
          <AnimatePresence>
            {showDropdown && (
              <motion.div 
                className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Your Profile</a>
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</a>
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Sign out</a>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Header;
