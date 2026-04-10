import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

const Header = () => {
  const { currentUser: user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);

  const getPageTitle = () => {
    const path = location.pathname.split('/').pop();

    if (path === 'admin' || path === 'interviewer') return 'Dashboard';
    if (path === 'scheduled-interviews') return 'Your Scheduled Interviews';
    if (path === 'completed-interviews') return 'Completed Interviews';
    if (path === 'profile') return 'Your Profile';
    if (path === 'settings') return 'Account Settings';

    return path.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleLogout = () => {
    setShowDropdown(false);
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="bg-white shadow-md border-b border-gray-100 h-16 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center">
        <h1 className="text-lg sm:text-xl font-semibold text-gray-800">
          <span className="hidden sm:inline">{getPageTitle()}</span>
          <span className="sm:hidden">
            {getPageTitle().length > 15 ? getPageTitle().substring(0, 15) + '...' : getPageTitle()}
          </span>
        </h1>
      </div>

      <div className="flex items-center">
        <div className="relative">
          <Button
            variant="ghost"
            className="flex items-center gap-1 p-1 h-auto"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white text-sm font-semibold shadow-md">
                {user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
            <ChevronDown className="h-5 w-5 text-gray-500" />
          </Button>

          <AnimatePresence>
            {showDropdown && (
              <motion.div
                className="absolute right-0 mt-2 w-48 rounded-xl shadow-md py-1 bg-white ring-1 ring-black ring-opacity-5 z-50"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Link to="/interviewer/profile" onClick={() => setShowDropdown(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Profile
                </Link>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-none justify-start h-auto font-normal"
                >
                  Sign out
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Header;
