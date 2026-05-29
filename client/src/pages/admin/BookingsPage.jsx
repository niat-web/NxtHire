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

const BookingsSidebar = memo(({ activeTab, onTabClick, counts }) => (
  <aside className="w-60 flex-shrink-0 bg-card border-r border-border flex flex-col">
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
    <div className="flex h-full w-full overflow-hidden bg-background">
      <BookingsSidebar activeTab={activeTab} onTabClick={handleTabClick} counts={counts} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <ActiveComponent key={activeTab} />
      </main>
    </div>
  );
};

export default BookingsPage;
