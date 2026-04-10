import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { LogOut, ChevronRight, ChevronUp, User, Bell, KeyRound } from 'lucide-react';
import logoSrc from '/logo.svg';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const Sidebar = ({ navItems, variant = 'admin' }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  const styles = {
    admin: {
      bg: 'bg-slate-900',
      border: 'border-slate-800',
      sectionLabel: 'text-indigo-400',
      linkText: 'text-slate-300',
      linkHoverText: 'hover:text-white',
      linkHoverBg: 'hover:bg-slate-800',
      linkActiveBg: 'bg-indigo-600',
      linkActiveText: 'text-white',
      userText: 'text-white',
      userRoleText: 'text-slate-400',
    },
    interviewer: {
      bg: 'bg-slate-900',
      border: 'border-slate-800',
      sectionLabel: 'text-indigo-400',
      linkText: 'text-slate-300',
      linkHoverText: 'hover:text-white',
      linkHoverBg: 'hover:bg-slate-800',
      linkActiveBg: 'bg-indigo-600',
      linkActiveText: 'text-white',
      userText: 'text-white',
      userRoleText: 'text-slate-400',
    }
  };

  const theme = styles[variant] || styles.admin;

  const profileMenuItems = variant === 'admin'
    ? [
        { label: 'Notifications', icon: Bell, action: () => { navigate('/admin/notifications'); setMenuOpen(false); } },
        { label: 'User Management', icon: User, action: () => { navigate('/admin/user-management'); setMenuOpen(false); } },
      ]
    : [
        { label: 'Edit Profile', icon: User, action: () => { navigate('/interviewer/settings/profile'); setMenuOpen(false); } },
        { label: 'Notifications', icon: Bell, action: () => { navigate('/interviewer/settings/notifications'); setMenuOpen(false); } },
        { label: 'Change Password', icon: KeyRound, action: () => { navigate('/interviewer/settings/security'); setMenuOpen(false); } },
      ];

  return (
    <div className={cn('sticky top-0 h-screen w-[232px] flex-shrink-0 shadow-xl overflow-visible', theme.bg)}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className={cn('flex items-center h-14 border-b px-5 shrink-0', theme.border)}>
          <img src={logoSrc} alt="Logo" className="h-8 w-auto" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-2 px-2.5 flex flex-col justify-between min-h-0">
          <div>
            {navItems.map((item, index) => {
              if (item.section) {
                return (
                  <div key={`section-${item.section}`} className={cn('px-3 pt-5 pb-1.5', index === 0 && 'pt-2')}>
                    <p className={cn('text-[11px] font-semibold uppercase tracking-wider', theme.sectionLabel)}>
                      {item.section}
                    </p>
                  </div>
                );
              }

              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={cn(
                    'relative flex items-center py-2 px-3 text-sm font-medium rounded-lg transition-all duration-150',
                    isActive
                      ? cn(theme.linkActiveBg, theme.linkActiveText, 'shadow-sm')
                      : cn(theme.linkText, theme.linkHoverText, theme.linkHoverBg)
                  )}
                >
                  <div className="flex-shrink-0 [&>svg]:w-[18px] [&>svg]:h-[18px]">
                    {item.icon}
                  </div>
                  <span className="ml-2.5 flex-1 whitespace-nowrap overflow-hidden text-ellipsis">{item.label}</span>
                  <div className="ml-auto flex items-center space-x-1.5 flex-shrink-0">
                    {item.displayCount > 0 && (
                      <span className="inline-block py-px px-1.5 text-[10px] font-semibold rounded-full bg-red-500 text-white blinking-count leading-4">
                        {item.displayCount}
                      </span>
                    )}
                    {item.hasSubmenu && (
                      <ChevronRight className="h-3.5 w-3.5" />
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom — User profile with popup menu */}
        <div className={cn('border-t px-2.5 py-2.5 shrink-0 relative', theme.border)} ref={menuRef}>
          {/* Popup menu */}
          {menuOpen && (
            <div className="absolute bottom-2 left-full ml-2 w-60 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
              {/* User info at top of popup */}
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {currentUser?.firstName} {currentUser?.lastName}
                </p>
                <p className="text-xs text-gray-400 truncate">{currentUser?.email}</p>
              </div>

              {/* Menu items */}
              <div className="py-1">
                {profileMenuItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <item.icon size={15} className="text-gray-400" />
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Sign out */}
              <div className="border-t border-gray-100 py-1">
                <button
                  onClick={() => { logout(); setMenuOpen(false); }}
                  className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={15} />
                  Sign out
                </button>
              </div>
            </div>
          )}

          {/* Clickable user bar */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={cn(
              'flex items-center w-full px-3 py-2 rounded-lg transition-all duration-150',
              menuOpen ? 'bg-slate-800' : 'hover:bg-slate-800'
            )}
          >
            <Avatar className="h-8 w-8 bg-white/20 shrink-0">
              <AvatarFallback className={cn('bg-white/20 font-semibold text-xs', theme.userText)}>
                {currentUser?.firstName?.charAt(0) || 'A'}
              </AvatarFallback>
            </Avatar>
            <div className="ml-2.5 min-w-0 text-left flex-1">
              <p className={cn('text-sm font-medium truncate leading-tight', theme.userText)}>
                {currentUser?.firstName} {currentUser?.lastName}
              </p>
              <p className={cn('text-xs capitalize leading-tight', theme.userRoleText)}>{currentUser?.role}</p>
            </div>
            <ChevronUp size={14} className={cn('text-slate-500 transition-transform shrink-0', !menuOpen && 'rotate-180')} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
