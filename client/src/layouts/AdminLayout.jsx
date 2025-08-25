import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import { FiHome, FiUserCheck, FiMenu, FiShield, FiCalendar, FiGrid, FiSettings, FiClipboard, FiMail } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import { getDashboardStats } from '../api/admin.api';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser } = useAuth();
  const location = useLocation();
  const [apiCounts, setApiCounts] = useState({});
  
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const fetchApiCounts = useCallback(async () => {
    try {
      const res = await getDashboardStats();
      setApiCounts(res.data.data || {});
    } catch (error) {
      console.error("Failed to load sidebar counts", error);
    }
  }, []);

  useEffect(() => {
    setSidebarOpen(false); 
    fetchApiCounts(); 

    const interval = setInterval(fetchApiCounts, 60000); 
    return () => clearInterval(interval);
  }, [fetchApiCounts, location.pathname]);

  const adminNavItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: <FiHome className="w-5 h-5" /> },
    { label: 'Interviewers Hiring', path: '/admin/hiring', icon: <FiClipboard className="w-5 h-5" />, hasSubmenu: true },
    { label: 'Interviewers', path: '/admin/interviewers', icon: <FiUserCheck className="w-5 h-5" /> },
    { label: 'User Management', path: '/admin/user-management', icon: <FiShield className="w-5 h-5" /> },
    { label: 'Main Sheet', path: '/admin/main-sheet', icon: <FiGrid className="w-5 h-5" /> }, 
    { label: 'New Interviews', path: '/admin/bookings', icon: <FiCalendar className="w-5 h-5" />, hasSubmenu: true },
    { label: 'Custom Email', path: '/admin/custom-email', icon: <FiMail className="w-5 h-5" /> },
    { label: 'Evaluation Setup', path: '/admin/evaluation-setup', icon: <FiSettings className="w-5 h-5" /> },
    { label: 'Domain Evaluation', path: '/admin/domain-evaluation', icon: <FiClipboard className="w-5 h-5" /> },
  ];

  const adminNavItemsWithCounts = useMemo(() => {
    const hiringCountKeys = ['pendingLinkedInReviews', 'pendingSkillsReview', 'pendingGuidelinesReview'];
    const totalHiringCount = hiringCountKeys.reduce((sum, key) => sum + (apiCounts[key] || 0), 0);

    return adminNavItems.map(item => {
        const newItem = { ...item };
        if (item.path === '/admin/hiring' && totalHiringCount > 0) {
            newItem.displayCount = totalHiringCount;
        }
        return newItem;
    });
  }, [apiCounts, adminNavItems]);

  const getPageTitle = () => {
    const allNavItems = [
      ...adminNavItems,
      { label: 'Applicants', path: '/admin/hiring/applicants' },
      { label: 'LinkedIn Review', path: '/admin/hiring/linkedin-review' },
      { label: 'Skills Review', path: '/admin/hiring/skill-categorization' },
      { label: 'Guidelines Review', path: '/admin/hiring/guidelines' },
      { label: 'Interviewer Bookings', path: '/admin/bookings/interviewer-bookings'},
      { label: 'Booking Slots', path: '/admin/bookings/booking-slots' },
      { label: 'Student Bookings', path: '/admin/bookings/student-bookings' },
    ];
    
    const currentNav = allNavItems.find(item => location.pathname.startsWith(item.path));
    return currentNav?.label || 'Admin Panel';
  };
  
  // --- MODIFICATION START: Added all specified pages to this list ---
  const fullPageLayoutPaths = [
      '/admin/hiring',
      '/admin/bookings',
      '/admin/interviewers',
      '/admin/user-management',
      '/admin/main-sheet',
      '/admin/custom-email',
      '/admin/evaluation-setup',
      '/admin/domain-evaluation'
  ];
  // --- MODIFICATION END ---
  
  const useFullPageLayout = fullPageLayoutPaths.some(path => location.pathname.startsWith(path));

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        navItems={adminNavItemsWithCounts} 
        isOpen={sidebarOpen} 
        toggleSidebar={toggleSidebar} 
        variant="admin"
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        { !useFullPageLayout && (
          <header className="bg-white border-b border-gray-200 px-4 py-3 lg:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={toggleSidebar}
                  className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                >
                  <FiMenu className="h-6 w-6" />
                </button>
                <div className="ml-4 lg:ml-0">
                  <h1 className="text-xl font-semibold text-gray-900">{getPageTitle()}</h1>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="font-semibold text-blue-600 text-sm">
                      {currentUser?.firstName?.charAt(0) || 'A'}
                    </span>
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <p className="text-sm font-medium text-gray-700">
                      {currentUser?.firstName} {currentUser?.lastName}
                    </p>
                    <p className="text-xs text-gray-500">Administrator</p>
                  </div>
                </div>
              </div>
            </div>
          </header>
        )}

        <main className="flex-1 overflow-y-auto bg-gray-50">
          {useFullPageLayout ? (
            <div className="h-full">
                <Outlet />
            </div>
          ) : (
            <div className="container mx-auto px-4 py-6 lg:px-6 lg:py-8">
                <Outlet />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;