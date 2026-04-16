import React, { useMemo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import PageTransition from '../components/common/PageTransition';
import { Home, UserCheck, Shield, Calendar, Grid, Settings, Clipboard, Mail, BarChart2, Bell } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useDashboardStats } from '../hooks/useAdminQueries';
import { cn } from '@/lib/utils';
import NotificationBell from '../components/admin/NotificationBell';

const AdminLayout = () => {
  const { currentUser } = useAuth();
  const location = useLocation();

  const { data: apiCounts = {} } = useDashboardStats({
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
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
  ];

  const useFullPageLayout = fullPageLayoutPaths.some(path => location.pathname.startsWith(path));

  return (
    <div className="flex h-screen bg-[#f5f7fb]">
      <Sidebar
        navItems={adminNavItemsWithCounts}
        variant="admin"
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar — only on dashboard */}
        {location.pathname === '/admin/dashboard' && (
          <header className="bg-[#f0f4fa] border-b border-slate-200/80 h-12 flex items-center justify-between px-6 shrink-0">
            <h1 className="text-sm font-semibold text-slate-900">Dashboard</h1>
            <NotificationBell />
          </header>
        )}

        <main className={cn('flex-1 bg-[#f5f7fb]', useFullPageLayout ? 'overflow-hidden' : 'overflow-y-auto')}>
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
