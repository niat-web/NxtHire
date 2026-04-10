import React, { useState, useCallback, memo } from 'react';
import { Users, Globe, Briefcase, FileText } from 'lucide-react';
import { useDashboardStats } from '@/hooks/useAdminQueries';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

import Applicants from './Applicants';
import LinkedInReviewPage from './LinkedInReviewPage';
import SkillCategorizationPage from './SkillCategorizationPage';
import AdminGuidelines from './Guidelines';

const tabs = [
  { id: 'applicants', label: 'Applicants', icon: Users },
  { id: 'linkedin-review', label: 'LinkedIn Review', icon: Globe, countKey: 'pendingLinkedInReviews' },
  { id: 'skill-categorization', label: 'Skills Review', icon: Briefcase, countKey: 'pendingSkillsReview' },
  { id: 'guidelines', label: 'Guidelines Review', icon: FileText, countKey: 'pendingGuidelinesReview' },
];

const tabComponents = {
  'applicants': Applicants,
  'linkedin-review': LinkedInReviewPage,
  'skill-categorization': SkillCategorizationPage,
  'guidelines': AdminGuidelines,
};

const BASE = '/admin/hiring';

// Memoized sidebar — only re-renders when activeTab or counts change
const HiringSidebar = memo(({ activeTab, onTabClick, counts }) => (
  <aside className="w-56 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
    <div className="px-5 py-4 border-b border-gray-100">
      <h2 className="text-base font-semibold text-gray-900">Interviewer Hiring</h2>
    </div>
    <nav className="flex-1 p-3 space-y-0.5">
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        const count = tab.countKey ? (counts[tab.countKey] || 0) : 0;
        return (
          <button
            key={tab.id}
            onClick={() => onTabClick(tab.id)}
            className={cn(
              'flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-150',
              isActive
                ? 'bg-indigo-600 text-white shadow'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            )}
          >
            <tab.icon className="w-5 h-5" />
            <span className="ml-3 flex-1 text-left">{tab.label}</span>
            {count > 0 && (
              <Badge className={cn('ml-auto', isActive ? 'bg-white/20 text-white border-transparent' : 'bg-red-500 text-white border-transparent blinking-count')}>
                {count}
              </Badge>
            )}
          </button>
        );
      })}
    </nav>
  </aside>
));
HiringSidebar.displayName = 'HiringSidebar';

// Derive initial tab from current URL
const getInitialTab = () => {
  const suffix = window.location.pathname.replace(BASE, '').replace(/^\//, '');
  return tabs.find(t => t.id === suffix)?.id || 'applicants';
};

const HiringPage = () => {
  const [activeTab, setActiveTab] = useState(getInitialTab);
  const { data: counts = {} } = useDashboardStats({ staleTime: 60 * 1000, refetchInterval: 60 * 1000 });

  const handleTabClick = useCallback((tabId) => {
    setActiveTab(tabId);
    // Update URL without triggering React Router re-render
    window.history.replaceState(null, '', `${BASE}/${tabId}`);
  }, []);

  const ActiveComponent = tabComponents[activeTab];

  return (
    <div className="flex h-full w-full overflow-hidden">
      <HiringSidebar activeTab={activeTab} onTabClick={handleTabClick} counts={counts} />
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <ActiveComponent key={activeTab} />
      </main>
    </div>
  );
};

export default HiringPage;
