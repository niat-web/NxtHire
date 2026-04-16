import React, { memo } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { User, Bell, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

const settingsNavItems = [
  { label: 'Profile', path: '/interviewer/settings/profile', icon: <User className="w-4 h-4" /> },
  { label: 'Notifications', path: '/interviewer/settings/notifications', icon: <Bell className="w-4 h-4" /> },
  { label: 'Security', path: '/interviewer/settings/security', icon: <Shield className="w-4 h-4" /> },
];

const SettingsSidebar = memo(() => (
  <aside className="w-56 flex-shrink-0 bg-[#f0f4fa] border-r border-slate-200/80 flex flex-col">
    <div className="px-5 py-4 border-b border-slate-200/60">
      <h2 className="text-base font-semibold text-slate-900">Settings</h2>
    </div>
    <nav className="flex-1 p-3 space-y-0.5">
      {settingsNavItems.map(item => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
              isActive
                ? 'bg-white text-blue-700 shadow-sm border border-slate-200/60'
                : 'text-slate-600 hover:bg-white/70 hover:text-slate-900'
            )
          }
        >
          {item.icon}
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  </aside>
));

SettingsSidebar.displayName = 'SettingsSidebar';

const SettingsLayout = () => (
  <div className="flex h-full w-full overflow-hidden">
    <SettingsSidebar />
    <main className="flex-1 overflow-y-auto bg-[#f5f7fb]">
      <Outlet />
    </main>
  </div>
);

export default SettingsLayout;
