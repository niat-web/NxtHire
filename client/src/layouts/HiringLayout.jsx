import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { FiUsers, FiLinkedin, FiBriefcase, FiFileText } from 'react-icons/fi';
import { getDashboardStats } from '@/api/admin.api';

const HiringLayout = () => {
  const [apiCounts, setApiCounts] = useState({});
  const location = useLocation();
  const [acknowledgedCounts, setAcknowledgedCounts] = useState({});

  const hiringNavItems = useMemo(() => [
    { label: 'Applicants', path: '/admin/hiring/applicants', icon: <FiUsers className="w-5 h-5" /> },
    { label: 'LinkedIn Review', path: '/admin/hiring/linkedin-review', icon: <FiLinkedin className="w-5 h-5" />, countKey: 'pendingLinkedInReviews' },
    { label: 'Skills Review', path: '/admin/hiring/skill-categorization', icon: <FiBriefcase className="w-5 h-5" />, countKey: 'pendingSkillsReview' },
    { label: 'Guidelines Review', path: '/admin/hiring/guidelines', icon: <FiFileText className="w-5 h-5" />, countKey: 'pendingGuidelinesReview' },
  ], []);

  const fetchApiCounts = useCallback(async () => {
    try {
      const res = await getDashboardStats();
      setApiCounts(res.data.data || {});
    } catch (error) {
      console.error("Failed to load hiring counts", error);
    }
  }, []);

  useEffect(() => {
    fetchApiCounts();
    const interval = setInterval(fetchApiCounts, 60000);
    return () => clearInterval(interval);
  }, [fetchApiCounts]);

  // Acknowledge counts when visiting a specific page to stop the blinking
  useEffect(() => {
    const currentNavItem = hiringNavItems.find(item => item.path === location.pathname);
    if (currentNavItem && currentNavItem.countKey && apiCounts[currentNavItem.countKey] !== undefined) {
      setAcknowledgedCounts(prev => ({
        ...prev,
        [currentNavItem.countKey]: apiCounts[currentNavItem.countKey]
      }));
    }
  }, [location.pathname, apiCounts, hiringNavItems]);
  
  // Compute which items should display a count
  const navItemsWithCounts = useMemo(() => {
    return hiringNavItems.map(item => {
      let displayCount = null;
      if (item.countKey) {
        const currentApiCount = apiCounts[item.countKey] || 0;
        const lastAcknowledgedCount = acknowledgedCounts[item.countKey];

        if (lastAcknowledgedCount === undefined) {
          if (currentApiCount > 0) displayCount = currentApiCount;
        } else if (currentApiCount > lastAcknowledgedCount) {
          displayCount = currentApiCount;
        } else if (location.pathname !== item.path && currentApiCount > 0) {
            // Show non-blinking count if not on the page
            displayCount = currentApiCount;
        }
      }

      return { ...item, displayCount };
    });
  }, [hiringNavItems, apiCounts, acknowledgedCounts, location.pathname]);

  return (
    <div className="flex h-full w-full bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      <aside className="w-64 flex-shrink-0 bg-gray-50/75 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">Interviewer Hiring</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItemsWithCounts.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 relative ${
                  isActive
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                }`
              }
            >
              {item.icon}
              <span className="ml-3 flex-1">{item.label}</span>
              {item.displayCount > 0 && (
                 <span className={`ml-auto inline-block py-0.5 px-2 text-xs font-bold rounded-full ${location.pathname === item.path ? 'bg-white/20 text-white' : 'bg-red-500 text-white blinking-count'}`}>
                    {item.displayCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="h-full">
            <Outlet />
        </div>
      </main>
    </div>
  );
};

export default HiringLayout;