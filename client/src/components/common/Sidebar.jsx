import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { LogOut, ChevronRight, ChevronUp, User, Bell, KeyRound } from 'lucide-react';
import logoSrc from '/logo.svg';
import { cn } from '@/lib/utils';

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
    <div className="sticky top-0 h-screen w-64 flex-shrink-0 overflow-visible z-40">
      <aside className="flex h-full flex-col bg-[#f0f4fa] border-r border-slate-200/80">

        {/* Header — brand with existing logo */}
        <div className="flex items-center px-5 pt-5 pb-4 shrink-0 border-b border-slate-200/60">
          <img src={logoSrc} alt="Logo" className="h-8 w-auto" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-3 min-h-0 overflow-y-auto custom-scrollbar space-y-px">
          {navItems.map((item, index) => {
            if (item.section) {
              return (
                <div key={`section-${item.section}`} className={cn('px-3 pt-4 pb-1.5', index === 0 && 'pt-1')}>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
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
                  'group relative flex items-center gap-3 w-full rounded-lg pl-4 pr-3 py-2 text-[13px] font-medium transition-all duration-200',
                  isActive
                    ? 'bg-white text-blue-700 shadow-sm border border-slate-200/60'
                    : 'text-slate-600 hover:bg-white/70 hover:text-slate-900'
                )}
              >
                {/* Active left accent bar */}
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-blue-600" />
                )}
                <div className={cn(
                  'flex-shrink-0 [&>svg]:h-[17px] [&>svg]:w-[17px] transition-colors',
                  isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                )}>
                  {item.icon}
                </div>
                <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis tracking-tight">{item.label}</span>
                <div className="ml-auto flex items-center space-x-1.5 flex-shrink-0">
                  {item.displayCount > 0 && (
                    <span className="inline-block py-px px-1.5 text-[10px] font-bold rounded-full bg-rose-500 text-white blinking-count leading-4">
                      {item.displayCount}
                    </span>
                  )}
                  {item.hasSubmenu && (
                    <ChevronRight className={cn('h-3.5 w-3.5 transition-opacity', isActive ? 'opacity-60 text-blue-500' : 'opacity-30 group-hover:opacity-60')} />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom — compact user row; popup opens to the right outside sidebar */}
        <div className="border-t border-slate-200/60 px-3 py-3 shrink-0 relative" ref={menuRef}>
          {/* Profile popup menu — right side, outside sidebar */}
          {menuOpen && (
            <div className="absolute bottom-2 left-full ml-3 w-64 bg-white rounded-xl shadow-xl shadow-slate-900/10 border border-slate-200 overflow-hidden z-50">
              <div className="px-4 py-3.5 border-b border-slate-100 bg-slate-50">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {currentUser?.firstName} {currentUser?.lastName}
                </p>
                <p className="text-xs text-slate-500 truncate mt-0.5">{currentUser?.email}</p>
              </div>
              <div className="py-1.5">
                {profileMenuItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <item.icon size={15} className="text-slate-400" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
              <div className="border-t border-slate-100 py-1.5">
                <button
                  onClick={() => { logout(); setMenuOpen(false); }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut size={15} />
                  Sign out
                </button>
              </div>
            </div>
          )}

          {/* Compact user row — click to open popup */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={cn(
              'flex items-center w-full gap-3 rounded-lg px-2.5 py-2 transition-colors',
              menuOpen ? 'bg-white/80' : 'hover:bg-white/60'
            )}
          >
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {currentUser?.firstName?.charAt(0) || 'A'}
            </div>
            <div className="min-w-0 text-left flex-1">
              <p className="text-[12px] font-semibold truncate leading-tight text-slate-900">
                {currentUser?.firstName} {currentUser?.lastName}
              </p>
              <p className="text-[10px] capitalize leading-tight text-slate-500 mt-0.5">
                {currentUser?.role}
              </p>
            </div>
            <ChevronUp size={13} className={cn('text-slate-400 transition-transform shrink-0', !menuOpen && 'rotate-180')} />
          </button>
        </div>
      </aside>
    </div>
  );
};

export default Sidebar;
