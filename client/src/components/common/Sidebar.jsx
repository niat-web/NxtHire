import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { LogOut, ChevronRight, ChevronsUpDown, User, Bell, KeyRound, Settings } from 'lucide-react';
import logoSrc from '/logo.svg';
import { cn } from '@/lib/utils';

const ACCENT = '#FF4800';

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
        { label: 'Settings', icon: Settings, action: () => { navigate('/admin/settings'); setMenuOpen(false); } },
        { label: 'User Management', icon: User, action: () => { navigate('/admin/user-management'); setMenuOpen(false); } },
      ]
    : [
        { label: 'Edit Profile', icon: User, action: () => { navigate('/interviewer/settings/profile'); setMenuOpen(false); } },
        { label: 'Notifications', icon: Bell, action: () => { navigate('/interviewer/settings/notifications'); setMenuOpen(false); } },
        { label: 'Change Password', icon: KeyRound, action: () => { navigate('/interviewer/settings/security'); setMenuOpen(false); } },
      ];

  const workspaceLabel = variant === 'admin' ? 'Admin Console' : 'Interviewer';

  // Derive user initials robustly (first letter of first + last name).
  const initials = `${currentUser?.firstName?.charAt(0) || ''}${currentUser?.lastName?.charAt(0) || ''}`.toUpperCase() || 'A';

  return (
    <div className="sticky top-0 h-screen w-64 flex-shrink-0 overflow-visible z-40">
      <aside className="flex h-full flex-col bg-white border-r border-slate-200">

        {/* Brand block: logo + workspace eyebrow */}
        <div className="px-6 pt-6 pb-5 shrink-0 border-b border-slate-100">
          <img src={logoSrc} alt="NxtHire" className="h-7 w-auto" />
          <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.2em] text-slate-600">
            <span className="h-1 w-1 rounded-full" style={{ backgroundColor: ACCENT }} aria-hidden="true" />
            {workspaceLabel}
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-3 min-h-0 overflow-y-auto custom-scrollbar">
          {navItems.map((item, index) => {
            if (item.section) {
              return (
                <div key={`section-${item.section}`} className={cn('px-3 pt-5 pb-2', index === 0 && 'pt-2')}>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
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
                  'group relative flex items-center gap-3 w-full rounded-xl pl-3 pr-3 py-2 text-[13px] font-medium transition-colors',
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                {/* Orange left edge accent on active — subtle signature */}
                {isActive && (
                  <span
                    className="absolute left-0 top-2 bottom-2 w-[2.5px] rounded-r-full"
                    style={{ backgroundColor: ACCENT }}
                    aria-hidden="true"
                  />
                )}

                <span className={cn(
                  'flex-shrink-0 inline-flex items-center justify-center [&>svg]:h-[16px] [&>svg]:w-[16px] transition-colors',
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700'
                )}>
                  {item.icon}
                </span>

                <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis tracking-tight">{item.label}</span>

                <span className="ml-auto flex items-center gap-1.5 flex-shrink-0">
                  {item.displayCount > 0 && (
                    <span
                      className={cn(
                        'inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 text-[10px] font-semibold rounded-full',
                        isActive ? 'bg-white text-slate-900' : 'text-white'
                      )}
                      style={!isActive ? { backgroundColor: ACCENT } : undefined}
                    >
                      {item.displayCount}
                    </span>
                  )}
                  {item.hasSubmenu && (
                    <ChevronRight
                      className={cn('h-3.5 w-3.5 transition-opacity', isActive ? 'opacity-70' : 'opacity-30 group-hover:opacity-60')}
                      aria-hidden="true"
                    />
                  )}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom user block */}
        <div className="border-t border-slate-100 p-3 shrink-0 relative" ref={menuRef}>
          {menuOpen && (
            <div className="absolute bottom-2 left-full ml-3 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50">
              <div className="px-4 py-3.5 border-b border-slate-100 bg-slate-50/70">
                <p className="text-[13px] font-semibold text-slate-900 truncate">
                  {currentUser?.firstName} {currentUser?.lastName}
                </p>
                <p className="text-[12px] text-slate-500 truncate mt-0.5">{currentUser?.email}</p>
              </div>
              <div className="py-1.5">
                {profileMenuItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-[13px] text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  >
                    <item.icon className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
              <div className="border-t border-slate-100 py-1.5">
                <button
                  onClick={() => { logout(); setMenuOpen(false); }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-[13px] font-semibold text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                  Sign out
                </button>
              </div>
            </div>
          )}

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={cn(
              'flex items-center w-full gap-3 rounded-xl px-2 py-2 border transition-colors',
              menuOpen ? 'border-slate-200 bg-slate-50' : 'border-transparent hover:border-slate-200 hover:bg-slate-50'
            )}
            aria-label="Open account menu"
          >
            {/* Editorial avatar: outlined tile with slate initials, not a heavy black disc */}
            <span className="h-9 w-9 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-900 text-[12.5px] font-semibold shrink-0">
              {initials}
            </span>
            <span className="min-w-0 text-left flex-1">
              <span className="block text-[12.5px] font-semibold truncate leading-tight text-slate-900">
                {currentUser?.firstName} {currentUser?.lastName}
              </span>
              <span className="mt-1 inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-1.5 py-px text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-600">
                <span className="h-1 w-1 rounded-full" style={{ backgroundColor: ACCENT }} aria-hidden="true" />
                {currentUser?.role}
              </span>
            </span>
            <ChevronsUpDown className="h-3.5 w-3.5 text-slate-400 shrink-0" aria-hidden="true" />
          </button>
        </div>
      </aside>
    </div>
  );
};

export default Sidebar;
