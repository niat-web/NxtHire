import React, { useMemo, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import PageTransition from '../components/common/PageTransition';
import { Home, UserCheck, Shield, Calendar, Grid, Settings, Clipboard, Mail, BarChart2, Bell, Menu } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useDashboardStats } from '../hooks/useAdminQueries';
import { cn } from '@/lib/utils';
import NotificationBell from '../components/admin/NotificationBell';

const AdminLayout = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Sidebar badges: refresh in the background but don't hammer the API every minute.
  // Socket.io pushes the most urgent updates already; a 3-minute poll covers the rest.
  const { data: apiCounts = {} } = useDashboardStats({
    staleTime: 2 * 60 * 1000,
    refetchInterval: 3 * 60 * 1000,
    refetchIntervalInBackground: false,
  });

  const adminNavItems = [
    { section: 'Overview' },
    { label: 'Dashboard', path: '/admin/dashboard', icon: <Home className="w-5 h-5" /> },
    { section: 'Hiring' },
    { label: 'Interviewers Hiring', path: '/admin/hiring', icon: <Clipboard className="w-5 h-5" />, hasSubmenu: true },
    { label: 'Interviewers', path: '/admin/interviewers', icon: <UserCheck className="w-5 h-5" /> },
    { section: 'Interviews' },
    { label: 'New Interviews', path: '/admin/bookings', icon: <Calendar className="w-5 h-5" />, hasSubmenu: true },
    { label: 'Main Sheet', path: '/admin/main-sheet', icon: <Grid className="w-5 h-5" /> },
    { label: 'Domain Evaluation', path: '/admin/domain-evaluation', icon: <Clipboard className="w-5 h-5" /> },
    { label: 'Earnings Report', path: '/admin/earnings-report', icon: <BarChart2 className="w-5 h-5" /> },
    { section: 'Settings' },
    { label: 'Notifications', path: '/admin/notifications', icon: <Bell className="w-5 h-5" /> },
    { label: 'Custom Email', path: '/admin/custom-email', icon: <Mail className="w-5 h-5" /> },
    { label: 'Evaluation Setup', path: '/admin/evaluation-setup', icon: <Settings className="w-5 h-5" /> },
    { label: 'User Management', path: '/admin/user-management', icon: <Shield className="w-5 h-5" /> },
  ];

  const adminNavItemsWithCounts = useMemo(() => {
    const hiringCountKeys = ['pendingLinkedInReviews', 'pendingSkillsReview', 'pendingGuidelinesReview'];
    const totalHiringCount = hiringCountKeys.reduce((sum, key) => sum + (apiCounts[key] || 0), 0);

    return adminNavItems.map(item => {
        if (item.section) return item;
        const newItem = { ...item };
        if (item.path === '/admin/hiring' && totalHiringCount > 0) {
            newItem.displayCount = totalHiringCount;
        }
        return newItem;
    });
  }, [apiCounts, adminNavItems]);

  const fullPageLayoutPaths = [
      '/admin/dashboard',
      '/admin/hiring',
      '/admin/bookings',
      '/admin/interviewers',
      '/admin/user-management',
      '/admin/main-sheet',
      '/admin/custom-email',
      '/admin/evaluation-setup',
      '/admin/domain-evaluation',
      '/admin/earnings-report',
      '/admin/notifications',
      '/admin/public-bookings/',
      '/admin/interview-bookings/',
      '/admin/notifications-inbox',
      '/admin/settings',
  ];

  const useFullPageLayout = fullPageLayoutPaths.some(path => location.pathname.startsWith(path));

  return (
    <div className="flex h-screen bg-background antialiased">
      <Sidebar
        navItems={adminNavItemsWithCounts}
        variant="admin"
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Mobile top bar — hamburger + brand. Hidden at lg+. */}
        <header className="lg:hidden bg-card border-b border-border h-14 flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="h-9 w-9 -ml-1 inline-flex items-center justify-center rounded-md text-foreground hover:bg-muted transition-colors"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-baseline gap-1">
              <span className="font-display text-[18px] font-extrabold tracking-tight text-primary leading-none">NXTHIRE</span>
              <span className="inline-block h-1.5 w-1.5 rounded-[2px]" style={{ backgroundColor: 'var(--brave-amber)' }} aria-hidden="true" />
            </div>
          </div>
          <NotificationBell />
        </header>

        {/* Desktop top bar — only on dashboard */}
        {location.pathname === '/admin/dashboard' && (
          <header className="hidden lg:flex bg-card border-b border-border h-14 items-center justify-between px-6 lg:px-10 shrink-0">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-[2px]" style={{ backgroundColor: 'var(--brave-amber)' }} />
                Admin
              </span>
              <h1 className="font-display text-[18px] font-bold text-foreground tracking-tight leading-none">Dashboard</h1>
            </div>
            <NotificationBell />
          </header>
        )}

        <main className={cn('flex-1 bg-background', useFullPageLayout ? 'overflow-hidden' : 'overflow-y-auto')}>
          {useFullPageLayout ? (
            <div className="h-full flex flex-col">
                <PageTransition className="h-full flex flex-col">
                  <Outlet />
                </PageTransition>
            </div>
          ) : (
            <PageTransition className="container mx-auto px-4 py-6 lg:px-6 lg:py-8">
                <Outlet />
            </PageTransition>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
