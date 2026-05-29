import React, { useState, useCallback, memo } from 'react';
import { Users, Globe, Briefcase, FileText } from 'lucide-react';
import { useDashboardStats } from '@/hooks/useAdminQueries';
import { cn } from '@/lib/utils';

import Applicants from './Applicants';
import LinkedInReviewPage from './LinkedInReviewPage';
import SkillCategorizationPage from './SkillCategorizationPage';
import AdminGuidelines from './Guidelines';

const tabs = [
  { id: 'applicants',           label: 'Applicants',        icon: Users },
  { id: 'linkedin-review',      label: 'LinkedIn Review',   icon: Globe,     countKey: 'pendingLinkedInReviews' },
  { id: 'skill-categorization', label: 'Skills Review',     icon: Briefcase, countKey: 'pendingSkillsReview' },
  { id: 'guidelines',           label: 'Guidelines Review', icon: FileText,  countKey: 'pendingGuidelinesReview' },
];

const tabComponents = {
  'applicants': Applicants,
  'linkedin-review': LinkedInReviewPage,
  'skill-categorization': SkillCategorizationPage,
  'guidelines': AdminGuidelines,
};

const BASE = '/admin/hiring';

// Desktop: vertical sidebar rail
const HiringSidebar = memo(({ activeTab, onTabClick, counts }) => (
  <aside className="hidden md:flex w-56 flex-shrink-0 bg-card border-r border-border flex-col">
    <nav className="flex-1 p-3 space-y-0.5">
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        const count = tab.countKey ? (counts[tab.countKey] || 0) : 0;
        return (
          <button
            key={tab.id}
            onClick={() => onTabClick(tab.id)}
            className={cn(
              'flex items-center w-full px-3 py-2 text-[13px] font-medium rounded-md transition-colors',
              isActive
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent'
            )}
          >
            <tab.icon className="w-4 h-4" />
            <span className="ml-2.5 flex-1 text-left">{tab.label}</span>
            {count > 0 && (
              <span className="ml-auto inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full text-[10px] font-bold bg-primary text-primary-foreground blinking-count">
                {count}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  </aside>
));
HiringSidebar.displayName = 'HiringSidebar';

// Mobile: horizontal scrolling tab strip at top
const HiringTabStrip = memo(({ activeTab, onTabClick, counts }) => (
  <div className="md:hidden border-b border-border bg-card shrink-0">
    <nav className="flex overflow-x-auto no-scrollbar px-3 gap-1">
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        const count = tab.countKey ? (counts[tab.countKey] || 0) : 0;
        return (
          <button
            key={tab.id}
            onClick={() => onTabClick(tab.id)}
            className={cn(
              'shrink-0 flex items-center gap-2 py-3 px-2 text-[12.5px] font-semibold border-b-2 transition-colors whitespace-nowrap',
              isActive
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
            {count > 0 && (
              <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full text-[10px] font-bold bg-primary text-primary-foreground">
                {count}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  </div>
));
HiringTabStrip.displayName = 'HiringTabStrip';

const getInitialTab = () => {
  const suffix = window.location.pathname.replace(BASE, '').replace(/^\//, '');
  return tabs.find(t => t.id === suffix)?.id || 'applicants';
};

const HiringPage = () => {
  const [activeTab, setActiveTab] = useState(getInitialTab);
  const { data: counts = {} } = useDashboardStats({ staleTime: 60 * 1000, refetchInterval: 3 * 60 * 1000 });

  const handleTabClick = useCallback((tabId) => {
    setActiveTab(tabId);
    window.history.replaceState(null, '', `${BASE}/${tabId}`);
  }, []);

  const ActiveComponent = tabComponents[activeTab];

  return (
    <div className="flex flex-col md:flex-row h-full w-full overflow-hidden bg-background">
      <HiringTabStrip activeTab={activeTab} onTabClick={handleTabClick} counts={counts} />
      <HiringSidebar activeTab={activeTab} onTabClick={handleTabClick} counts={counts} />
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <ActiveComponent key={activeTab} />
      </main>
    </div>
  );
};

export default HiringPage;
