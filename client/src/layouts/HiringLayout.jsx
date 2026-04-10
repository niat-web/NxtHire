import React, { memo } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Users, Linkedin, Briefcase, FileText } from 'lucide-react';
import { useDashboardStats } from '@/hooks/useAdminQueries';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const hiringNavItems = [
  { label: 'Applicants', path: '/admin/hiring/applicants', icon: <Users className="w-5 h-5" /> },
  { label: 'LinkedIn Review', path: '/admin/hiring/linkedin-review', icon: <Linkedin className="w-5 h-5" />, countKey: 'pendingLinkedInReviews' },
  { label: 'Skills Review', path: '/admin/hiring/skill-categorization', icon: <Briefcase className="w-5 h-5" />, countKey: 'pendingSkillsReview' },
  { label: 'Guidelines Review', path: '/admin/hiring/guidelines', icon: <FileText className="w-5 h-5" />, countKey: 'pendingGuidelinesReview' },
];

// Memoized sidebar — only re-renders when counts change, NOT on route change
const HiringSidebar = memo(({ counts }) => (
  <aside className="w-56 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
    <div className="px-5 py-4 border-b border-gray-100">
      <h2 className="text-base font-semibold text-gray-900">Interviewer Hiring</h2>
    </div>
    <nav className="flex-1 p-3 space-y-0.5">
      {hiringNavItems.map(item => {
        const count = item.countKey ? (counts[item.countKey] || 0) : 0;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200',
                isActive
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )
            }
          >
            {item.icon}
            <span className="ml-3 flex-1">{item.label}</span>
            {count > 0 && (
              <Badge className="ml-auto bg-red-500 text-white border-transparent blinking-count">
                {count}
              </Badge>
            )}
          </NavLink>
        );
      })}
    </nav>
  </aside>
));

HiringSidebar.displayName = 'HiringSidebar';

const HiringLayout = () => {
  // Use React Query — already cached from AdminLayout, no extra API call
  const { data: counts = {} } = useDashboardStats({
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });

  return (
    <div className="flex h-full w-full overflow-hidden">
      <HiringSidebar counts={counts} />
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
};

export default HiringLayout;
