import React, { useState, useCallback, memo } from 'react';
import { Calendar, Clock, Link2, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useInterviewBookings, usePublicBookings } from '@/hooks/useAdminQueries';

import InterviewBookings from './InterviewBookings';
import BookingSlots from './BookingSlots';
import StudentBookings from './StudentBookings';
import ConfirmedSlots from './ConfirmedSlots';

const tabs = [
  { id: 'interviewer-bookings', label: 'Interviewer bookings', icon: Calendar,    countKey: 'openBookings' },
  { id: 'booking-slots',        label: 'Booking slots',         icon: Clock },
  { id: 'student-bookings',     label: 'Public links',          icon: Link2,       countKey: 'publicLinks' },
  { id: 'confirmed-slots',      label: 'Confirmed slots',       icon: CheckCircle },
];

const tabComponents = {
  'interviewer-bookings': InterviewBookings,
  'booking-slots': BookingSlots,
  'student-bookings': StudentBookings,
  'confirmed-slots': ConfirmedSlots,
};

const BASE = '/admin/bookings';

// Desktop: vertical sidebar rail
const BookingsSidebar = memo(({ activeTab, onTabClick, counts }) => (
  <aside className="hidden md:flex w-60 flex-shrink-0 bg-card border-r border-border flex-col">
    <nav className="flex-1 p-3 space-y-0.5">
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        const count = tab.countKey ? (counts[tab.countKey] || 0) : 0;
        return (
          <button
            key={tab.id}
            onClick={() => onTabClick(tab.id)}
            className={cn(
              'group flex items-center w-full px-3 py-2 text-[13px] font-medium rounded-md transition-colors',
              isActive
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent'
            )}
          >
            <tab.icon className="w-4 h-4" aria-hidden="true" />
            <span className="ml-2.5 flex-1 text-left">{tab.label}</span>
            {count > 0 && (
              <span className="ml-auto inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full text-[10px] font-bold bg-primary text-primary-foreground">
                {count}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  </aside>
));
BookingsSidebar.displayName = 'BookingsSidebar';

// Mobile: horizontal scrolling tab strip at top
const BookingsTabStrip = memo(({ activeTab, onTabClick, counts }) => (
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
            <tab.icon className="w-3.5 h-3.5" aria-hidden="true" />
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
BookingsTabStrip.displayName = 'BookingsTabStrip';

const getInitialTab = () => {
  const suffix = window.location.pathname.replace(BASE, '').replace(/^\//, '');
  return tabs.find(t => t.id === suffix)?.id || 'interviewer-bookings';
};

const BookingsPage = () => {
  const [activeTab, setActiveTab] = useState(getInitialTab);

  const { data: bookings = [] } = useInterviewBookings();
  const { data: publicBookings = [] } = usePublicBookings();
  const counts = {
    openBookings: bookings.filter(b => b.status === 'Open').length,
    publicLinks: publicBookings.length,
  };

  const handleTabClick = useCallback((tabId) => {
    setActiveTab(tabId);
    window.history.replaceState(null, '', `${BASE}/${tabId}`);
  }, []);

  const ActiveComponent = tabComponents[activeTab];

  return (
    <div className="flex flex-col md:flex-row h-full w-full overflow-hidden bg-background">
      <BookingsTabStrip activeTab={activeTab} onTabClick={handleTabClick} counts={counts} />
      <BookingsSidebar activeTab={activeTab} onTabClick={handleTabClick} counts={counts} />
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <ActiveComponent key={activeTab} />
      </main>
    </div>
  );
};

export default BookingsPage;
