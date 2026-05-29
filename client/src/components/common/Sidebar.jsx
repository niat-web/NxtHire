import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { LogOut, ChevronRight, ChevronsUpDown, User, Bell, KeyRound, Settings, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * BRAVE-style Sidebar
 * - Desktop: persistent w-64 sidebar
 * - Mobile (< lg): off-canvas drawer with backdrop, opened/closed via `mobileOpen` + `onMobileClose` props
 *
 * Note: `sidebarInner` is rendered twice (once in the desktop wrapper, once in the
 * mobile drawer). A single useRef would bind to whichever container mounted last,
 * which broke the profile dropdown clicks. We detect "click inside profile menu"
 * via a data-attribute selector instead, so both copies work independently.
 */
const Sidebar = ({ navItems, variant = 'admin', mobileOpen = false, onMobileClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e) => {
      // If the click target is inside ANY profile-menu container, leave the menu open.
      if (e.target.closest('[data-sidebar-profile]')) return;
      setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [mobileOpen]);

  // Close drawer on route change
  useEffect(() => {
    if (mobileOpen && onMobileClose) onMobileClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

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

  const initials = `${currentUser?.firstName?.charAt(0) || ''}${currentUser?.lastName?.charAt(0) || ''}`.toUpperCase() || 'A';

  const sidebarInner = (
    <aside className="flex h-full flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">

      {/* Brand block */}
      <div className="px-6 pt-7 pb-6 shrink-0 flex items-start justify-between">
        <div className="flex items-baseline gap-1">
          <span
            className="font-display text-[26px] font-extrabold tracking-tight leading-none"
            style={{ color: 'hsl(var(--sidebar-primary))' }}
          >
            NXTHIRE
          </span>
          <span
            className="inline-block h-2 w-2 rounded-[2px]"
            style={{ backgroundColor: 'var(--brave-amber)' }}
            aria-hidden="true"
          />
        </div>
        {/* Close button — visible only inside mobile drawer */}
        {onMobileClose && (
          <button
            type="button"
            onClick={onMobileClose}
            className="lg:hidden h-8 w-8 rounded-md flex items-center justify-center text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 pb-3 min-h-0 overflow-y-auto sidebar-scrollbar">
        {navItems.map((item, index) => {
          if (item.section) {
            return (
              <div key={`section-${item.section}`} className={cn('px-3 pt-5 pb-2', index === 0 && 'pt-1')}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-sidebar-muted-foreground/80">
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
                'group relative flex items-center gap-3 w-full rounded-lg pl-3 pr-3 py-2.5 text-[13.5px] font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                  : 'text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-foreground'
              )}
            >
              <span className={cn(
                'flex-shrink-0 inline-flex items-center justify-center [&>svg]:h-[17px] [&>svg]:w-[17px] transition-colors',
                isActive ? 'text-sidebar-primary-foreground' : 'text-sidebar-foreground/70 group-hover:text-sidebar-foreground'
              )}>
                {item.icon}
              </span>

              <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis tracking-tight">{item.label}</span>

              <span className="ml-auto flex items-center gap-1.5 flex-shrink-0">
                {item.displayCount > 0 && (
                  <span
                    className={cn(
                      'inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 text-[10px] font-semibold rounded-full',
                      isActive
                        ? 'bg-sidebar-primary-foreground/15 text-sidebar-primary-foreground'
                        : 'bg-sidebar-primary text-sidebar-primary-foreground'
                    )}
                  >
                    {item.displayCount}
                  </span>
                )}
                {item.hasSubmenu && (
                  <ChevronRight
                    className={cn(
                      'h-3.5 w-3.5 transition-opacity',
                      isActive ? 'opacity-80' : 'opacity-50 group-hover:opacity-80'
                    )}
                    aria-hidden="true"
                  />
                )}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom user block */}
      <div className="border-t border-sidebar-border/70 p-3 shrink-0 relative" data-sidebar-profile>
        {menuOpen && (
          <div className="absolute bottom-2 left-full ml-3 w-64 bg-card text-card-foreground rounded-xl shadow-xl border border-border overflow-hidden z-50">
            <div className="px-4 py-3.5 border-b border-border bg-muted/40">
              <p className="text-[13px] font-semibold text-foreground truncate">
                {currentUser?.firstName} {currentUser?.lastName}
              </p>
              <p className="text-[12px] text-muted-foreground truncate mt-0.5">{currentUser?.email}</p>
            </div>
            <div className="py-1.5">
              {profileMenuItems.map((item) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-[13px] text-foreground hover:bg-muted transition-colors"
                >
                  <item.icon className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </div>
            <div className="border-t border-border py-1.5">
              <button
                onClick={() => { logout(); setMenuOpen(false); }}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-[13px] font-semibold text-destructive hover:bg-destructive/10 transition-colors"
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
            'flex items-center w-full gap-3 rounded-lg px-2 py-2 border transition-colors',
            menuOpen
              ? 'border-sidebar-border bg-sidebar-accent/70'
              : 'border-transparent hover:border-sidebar-border hover:bg-sidebar-accent/50'
          )}
          aria-label="Open account menu"
        >
          <span
            className="h-9 w-9 rounded-md flex items-center justify-center text-[12.5px] font-semibold shrink-0"
            style={{
              backgroundColor: 'hsl(var(--sidebar-primary))',
              color: 'hsl(var(--sidebar-primary-foreground))',
            }}
          >
            {initials}
          </span>
          <span className="min-w-0 text-left flex-1">
            <span className="block text-[12.5px] font-semibold truncate leading-tight text-sidebar-foreground">
              {currentUser?.firstName} {currentUser?.lastName}
            </span>
            <span className="block mt-0.5 text-[10.5px] font-medium uppercase tracking-[0.18em] text-sidebar-muted-foreground">
              {currentUser?.role}
            </span>
          </span>
          <ChevronsUpDown className="h-3.5 w-3.5 text-sidebar-muted-foreground shrink-0" aria-hidden="true" />
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop sidebar — visible at lg+, persistent */}
      <div className="hidden lg:block sticky top-0 h-screen w-64 flex-shrink-0 overflow-visible z-40">
        {sidebarInner}
      </div>

      {/* Mobile drawer — backdrop + slide-in panel */}
      <div
        className={cn(
          'lg:hidden fixed inset-0 z-50 transition-opacity duration-200',
          mobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        )}
        aria-hidden={!mobileOpen}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onMobileClose}
        />
        {/* Panel */}
        <div
          className={cn(
            'absolute inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl transition-transform duration-300',
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {sidebarInner}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
