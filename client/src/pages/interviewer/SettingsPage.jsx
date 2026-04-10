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

const SettingsSidebar = memo(({ activeTab, onTabClick }) => (
  <aside className="w-56 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
    <div className="px-5 py-4 border-b border-gray-100">
      <h2 className="text-base font-semibold text-gray-900">Settings</h2>
    </div>
    <nav className="flex-1 p-3 space-y-0.5">
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabClick(tab.id)}
            className={cn(
              'flex items-center gap-2.5 w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150',
              isActive
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            )}
          >
            <tab.icon className="w-4 h-4" />
            <span className="flex-1 text-left">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  </aside>
));
SettingsSidebar.displayName = 'SettingsSidebar';

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
    <div className="flex h-full w-full overflow-hidden">
      <SettingsSidebar activeTab={activeTab} onTabClick={handleTabClick} />
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <ActiveComponent key={activeTab} />
      </main>
    </div>
  );
};

export default SettingsPage;
