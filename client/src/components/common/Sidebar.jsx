import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FiLogOut, FiChevronRight, FiMenu, FiX } from 'react-icons/fi';
import { useState } from 'react';
import logoSrc from '/logo.svg';

const Sidebar = ({ navItems, variant = 'admin' }) => {
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const [isPinned, setIsPinned] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isExpanded = isPinned || isHovered;

  const styles = {
    admin: {
      bg: 'bg-slate-900',
      border: 'border-slate-800',
      logoText: '',
      linkText: 'text-slate-300',
      linkHoverText: 'hover:text-white',
      linkHoverBg: 'hover:bg-slate-800',
      linkActiveBg: 'bg-emerald-600',
      linkActiveText: 'text-white',
      userText: 'text-white',
      userRoleText: 'text-slate-400',
      logoutIcon: 'text-slate-400 hover:text-red-400',
      toggleIcon: 'text-slate-400 hover:text-white',
    },
    interviewer: {
      bg: 'bg-slate-900',
      border: 'border-slate-800',
      linkText: 'text-slate-300',
      linkHoverText: 'hover:text-white',
      linkHoverBg: 'hover:bg-slate-800',
      linkActiveBg: 'bg-emerald-600',
      linkActiveText: 'text-white',
      userText: 'text-white',
      userRoleText: 'text-slate-400',
      logoutIcon: 'text-slate-400 hover:text-red-400',
      toggleIcon: 'text-slate-400 hover:text-white',
    }
  };

  const theme = styles[variant] || styles.admin;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`sticky top-0 h-screen flex-shrink-0 ${isExpanded ? 'w-64' : 'w-20'} ${theme.bg} shadow-xl transition-[width] duration-300 ease-in-out overflow-hidden`}
    >
      <div className="flex flex-col h-full">
        {/* Header with logo and toggle icon */}
        <div className={`flex items-center ${isExpanded ? 'px-6 justify-between' : 'justify-center'} h-16 border-b ${theme.border}`}>
          {isExpanded ? (
            <div className="flex items-center gap-2">
              <img src={logoSrc} alt="Logo" className="h-9 w-auto" />
              {theme.logoText && <span className="font-semibold text-white whitespace-nowrap">{theme.logoText}</span>}
            </div>
          ) : (
            <img src={logoSrc} alt="Logo" className="w-8 h-8" />
          )}

          {/* Toggle pin button */}
          <button
            onClick={() => setIsPinned(!isPinned)}
            className={`${theme.toggleIcon} transition-colors p-1 rounded ${isExpanded ? '' : 'hidden'}`}
            title={isPinned ? 'Collapse sidebar' : 'Pin sidebar open'}
          >
            {isPinned ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`relative flex items-center ${isExpanded ? 'px-3' : 'justify-center px-2'} py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? `${theme.linkActiveBg} ${theme.linkActiveText} shadow-md`
                    : `${theme.linkText} ${theme.linkHoverText} ${theme.linkHoverBg}`
                }`}
                title={!isExpanded ? item.label : undefined}
              >
                <div className="flex-shrink-0">
                  {item.icon}
                </div>
                {isExpanded && (
                  <span className="ml-3 truncate flex-1 whitespace-nowrap">{item.label}</span>
                )}

                {isExpanded && (
                  <div className="ml-auto flex items-center space-x-2">
                    {item.displayCount > 0 && (
                      <span className="inline-block py-0.5 px-2 text-xs font-bold rounded-full bg-red-500 text-white blinking-count">
                        {item.displayCount}
                      </span>
                    )}
                    {item.hasSubmenu && (
                      <FiChevronRight className="h-5 w-5" />
                    )}
                  </div>
                )}

                {item.displayCount > 0 && !isExpanded && (
                  <span className={`absolute top-1 right-1 h-4 w-4 flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold blinking-count ring-2 ${theme.bg}`}>
                    {item.displayCount > 9 ? '9+' : item.displayCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className={`p-4 border-t ${theme.border} ${!isExpanded ? 'px-2' : ''}`}>
          {isExpanded ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center min-w-0">
                <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <span className={`font-semibold text-sm ${theme.userText}`}>
                    {currentUser?.firstName?.charAt(0) || 'A'}
                  </span>
                </div>
                <div className="ml-3 min-w-0">
                  <p className={`text-sm font-medium ${theme.userText} truncate`}>
                    {currentUser?.firstName} {currentUser?.lastName}
                  </p>
                  <p className={`text-xs ${theme.userRoleText} capitalize`}>{currentUser?.role}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className={`${theme.logoutIcon} transition-colors flex-shrink-0 ml-2`}
                title="Logout"
              >
                <FiLogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                <span className={`font-semibold text-xs ${theme.userText}`}>
                  {currentUser?.firstName?.charAt(0) || 'A'}
                </span>
              </div>
              <button
                onClick={logout}
                className={`${theme.logoutIcon} transition-colors`}
                title="Logout"
              >
                <FiLogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
