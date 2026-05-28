import React, { memo } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Users, Linkedin, Briefcase, FileText } from 'lucide-react';
import { useDashboardStats } from '@/hooks/useAdminQueries';
import { cn } from '@/lib/utils';

const DISPLAY = { fontFamily: 'Supreme, "Plus Jakarta Sans", system-ui, sans-serif' };

const hiringNavItems = [
  { label: 'Applicants', path: '/admin/hiring/applicants', icon: <Users className="w-4 h-4" /> },
  { label: 'LinkedIn Review', path: '/admin/hiring/linkedin-review', icon: <Linkedin className="w-4 h-4" />, countKey: 'pendingLinkedInReviews' },
  { label: 'Skills Review', path: '/admin/hiring/skill-categorization', icon: <Briefcase className="w-4 h-4" />, countKey: 'pendingSkillsReview' },
  { label: 'Guidelines Review', path: '/admin/hiring/guidelines', icon: <FileText className="w-4 h-4" />, countKey: 'pendingGuidelinesReview' },
];

const HiringSidebar = memo(({ counts }) => (
  <aside className="w-60 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col">
    <div className="px-6 py-5 border-b border-slate-100">
      <h2 style={DISPLAY} className="text-[20px] font-semibold text-slate-900 tracking-tight">Interviewer Hiring</h2>
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
                'group flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium rounded-xl transition-colors',
                isActive
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )
            }
          >
            {({ isActive }) => (
              <>
                {item.icon}
                <span className="flex-1">{item.label}</span>
                {count > 0 && (
                  <span
                    className={cn(
                      'inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 text-[10px] font-semibold rounded-full',
                      isActive ? 'bg-white text-slate-900' : 'text-white'
                    )}
                    style={!isActive ? { backgroundColor: '#C0392B' } : undefined}
                  >
                    {count}
                  </span>
                )}
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  </aside>
));

HiringSidebar.displayName = 'HiringSidebar';

const HiringLayout = () => {
  const { data: counts = {} } = useDashboardStats({
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });

  return (
    <div className="flex h-full w-full overflow-hidden">
      <HiringSidebar counts={counts} />
      <main className="flex-1 overflow-y-auto bg-[#fcfaf8]">
        <Outlet />
      </main>
    </div>
  );
};

export default HiringLayout;
