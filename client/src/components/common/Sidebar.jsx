import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FiLogOut, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useState } from 'react';
import logoSrc from '/logo.svg'; 

const Sidebar = ({ navItems, isOpen, toggleSidebar, variant = 'admin' }) => {
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const styles = {
    admin: {
      bg: 'bg-slate-900',
      border: 'border-slate-800',
      logoText: '',
      linkText: 'text-slate-300',
      linkHoverText: 'hover:text-white',
      linkHoverBg: 'hover:bg-slate-800',
      linkActiveBg: 'bg-blue-600',
      linkActiveText: 'text-white',
      userText: 'text-white',
      userRoleText: 'text-slate-400',
      logoutIcon: 'text-slate-400 hover:text-red-400',
      collapseIcon: 'text-slate-400 hover:text-white',
    },
    interviewer: {
      bg: 'bg-brandRed-800',
      border: 'border-brandRed-900/50',
      logoText: 'Interviewer Portal',
      linkText: 'text-brandRed-100',
      linkHoverText: 'hover:text-white',
      linkHoverBg: 'hover:bg-brandRed-700/60',
      linkActiveBg: 'bg-brandRed-700',
      linkActiveText: 'text-white',
      userText: 'text-white',
      userRoleText: 'text-brandRed-200',
      logoutIcon: 'text-brandRed-200 hover:text-white',
      collapseIcon: 'text-brandRed-200 hover:text-white',
    }
  };

  const theme = styles[variant] || styles.admin;

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-30 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
      <div 
        className={`fixed inset-y-0 left-0 z-30 ${collapsed ? 'w-20' : 'w-64'} ${theme.bg} shadow-xl transform transition-all duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className={`flex items-center ${collapsed ? 'justify-center px-2' : 'justify-between px-6'} h-16 border-b ${theme.border}`}>
            {!collapsed ? (
                <div className="flex items-center gap-2">
                    <img src={logoSrc} alt="Logo" className="h-9 w-auto" />
                    {theme.logoText && <span className="font-semibold text-white">{theme.logoText}</span>}
                </div>
            ) : (
                <img src={logoSrc} alt="Logo" className="w-8 h-8" />
            )}
            
            <button 
              onClick={toggleCollapse}
              className={`hidden lg:flex items-center justify-center w-6 h-6 rounded ${theme.collapseIcon}`}
            >
              {collapsed ? <FiChevronRight className="w-4 h-4" /> : <FiChevronLeft className="w-4 h-4" />}
            </button>
          </div>
          <nav className="flex-1 py-6 px-3 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
              <Link
                key={item.label}
                to={item.path}
                className={`relative flex items-center ${collapsed ? 'justify-center px-2' : 'px-3'} py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? `${theme.linkActiveBg} ${theme.linkActiveText} shadow-md`
                    : `${theme.linkText} ${theme.linkHoverText} ${theme.linkHoverBg}`
                }`}
                title={collapsed ? item.label : undefined}
              >
                <div className="flex-shrink-0">
                  {item.icon}
                </div>
                {!collapsed && (
                  <span className="ml-3 truncate flex-1">{item.label}</span>
                )}
                
                {/* --- MODIFICATION: Updated logic to show count and arrow --- */}
                {!collapsed && (
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
                
                {item.displayCount > 0 && collapsed && (
                  <span className={`absolute top-1 right-1 h-4 w-4 flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold blinking-count ring-2 ${theme.bg}`}>
                    {item.displayCount > 9 ? '9+' : item.displayCount}
                  </span>
                )}
              </Link>
            )})}
          </nav>

          <div className={`p-4 border-t ${theme.border} ${collapsed ? 'px-2' : ''}`}>
            {!collapsed ? (
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
    </>
  );
};

export default Sidebar;