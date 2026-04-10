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

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  const theme = {
    sectionLabel: 'text-indigo-500',
    linkText: 'text-indigo-200',
    linkHover: 'hover:bg-white/10 hover:text-white',
    linkActive: 'bg-indigo-600 text-white shadow-lg',
    userText: 'text-white',
    userRoleText: 'text-indigo-300',
  };

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
    <div className="sticky top-0 h-screen w-64 flex-shrink-0 overflow-visible shadow-xl z-40">
      <aside className="flex h-full flex-col bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900">

        {/* Header */}
        <div className="flex items-center border-b border-white/10 px-6 pt-5 shrink-0">
          <img src={logoSrc} alt="Logo" className="h-9 w-auto brightness-0 invert" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 px-4 py-4 min-h-0">
          {navItems.map((item, index) => {
            if (item.section) {
              return (
                <div key={`section-${item.section}`} className={cn('px-3 pt-5 pb-2', index === 0 && 'pt-1')}>
                  <p className={cn('text-xs font-semibold uppercase tracking-widest', theme.sectionLabel)}>
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
                  'flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive ? theme.linkActive : cn(theme.linkText, theme.linkHover)
                )}
              >
                <div className="flex-shrink-0 [&>svg]:h-4 [&>svg]:w-4">
                  {item.icon}
                </div>
                <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis">{item.label}</span>
                <div className="ml-auto flex items-center space-x-1.5 flex-shrink-0">
                  {item.displayCount > 0 && (
                    <span className="inline-block py-px px-1.5 text-[10px] font-semibold rounded-full bg-red-500 text-white blinking-count leading-4">
                      {item.displayCount}
                    </span>
                  )}
                  {item.hasSubmenu && (
                    <ChevronRight className="h-3.5 w-3.5 opacity-60" />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom — User profile with popup */}
        <div className="border-t border-white/10 px-4 py-4 shrink-0 relative" ref={menuRef}>
          {/* Popup menu — appears to the right */}
          {menuOpen && (
            <div className="absolute bottom-2 left-full ml-2 w-60 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {currentUser?.firstName} {currentUser?.lastName}
                </p>
                <p className="text-xs text-gray-400 truncate">{currentUser?.email}</p>
              </div>
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
              'flex items-center w-full gap-3 rounded-xl px-3 py-2.5 transition-all duration-200',
              menuOpen ? 'bg-white/10' : 'hover:bg-white/10'
            )}
          >
            <Avatar className="h-8 w-8 bg-indigo-600/50 shrink-0">
              <AvatarFallback className="bg-indigo-600/50 font-semibold text-xs text-white">
                {currentUser?.firstName?.charAt(0) || 'A'}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 text-left flex-1">
              <p className={cn('text-sm font-medium truncate leading-tight', theme.userText)}>
                {currentUser?.firstName} {currentUser?.lastName}
              </p>
              <p className={cn('text-[11px] capitalize leading-tight', theme.userRoleText)}>
                {currentUser?.role}
              </p>
            </div>
            <ChevronUp size={14} className={cn('text-indigo-400 transition-transform shrink-0', !menuOpen && 'rotate-180')} />
          </button>
        </div>
      </aside>
    </div>
  );
};

export default Sidebar;
