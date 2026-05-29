import React, { memo } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { User, Bell, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

const DISPLAY = { fontFamily: 'Supreme, "Plus Jakarta Sans", system-ui, sans-serif' };

const settingsNavItems = [
  { label: 'Profile', path: '/interviewer/settings/profile', icon: <User className="w-4 h-4" /> },
  { label: 'Notifications', path: '/interviewer/settings/notifications', icon: <Bell className="w-4 h-4" /> },
  { label: 'Security', path: '/interviewer/settings/security', icon: <Shield className="w-4 h-4" /> },
];

const SettingsSidebar = memo(() => (
  <aside className="w-60 flex-shrink-0 bg-white border-r border-border flex flex-col">
    <div className="px-6 py-5 border-b border-border">
      <h2 style={DISPLAY} className="text-[20px] font-semibold text-foreground tracking-tight">Settings</h2>
    </div>
    <nav className="flex-1 p-3 space-y-0.5">
      {settingsNavItems.map(item => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium rounded-xl transition-colors',
              isActive
                ? 'bg-primary text-white'
                : 'text-foreground/80 hover:bg-muted/40 hover:text-foreground'
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
    <main className="flex-1 overflow-y-auto bg-[#fcfaf8]">
      <Outlet />
    </main>
  </div>
);

export default SettingsLayout;
