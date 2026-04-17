import React, { useState, useCallback, memo } from 'react';
import { User, Bell, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

import Profile from './Profile';
import NotificationsPage from './NotificationsPage';
import SecurityPage from './SecurityPage';

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
];

const tabComponents = {
  'profile': Profile,
  'notifications': NotificationsPage,
  'security': SecurityPage,
};

const BASE = '/interviewer/settings';

const getInitialTab = () => {
  const suffix = window.location.pathname.replace(BASE, '').replace(/^\//, '');
  return tabs.find(t => t.id === suffix)?.id || 'profile';
};

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState(getInitialTab);

  const handleTabClick = useCallback((tabId) => {
    setActiveTab(tabId);
    window.history.replaceState(null, '', `${BASE}/${tabId}`);
  }, []);

  const ActiveComponent = tabComponents[activeTab];

  return (
    <div className="h-full flex flex-col overflow-hidden bg-white">
      {/* Tab bar at top */}
      <div className="flex items-center gap-1 px-5 py-2 border-b border-slate-200 bg-[#f8fafc] shrink-0">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => handleTabClick(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 text-[13px] font-medium rounded-md transition-all',
                isActive ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700 hover:bg-white/60'
              )}>
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <ActiveComponent key={activeTab} />
      </div>
    </div>
  );
};

export default SettingsPage;
