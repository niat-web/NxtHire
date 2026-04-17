import React, { useState, useCallback, memo } from 'react';
import { Calendar, Clock, Link2, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useInterviewBookings, usePublicBookings } from '@/hooks/useAdminQueries';

import InterviewBookings from './InterviewBookings';
import BookingSlots from './BookingSlots';
import StudentBookings from './StudentBookings';
import ConfirmedSlots from './ConfirmedSlots';

const tabs = [
  { id: 'interviewer-bookings', label: 'Interviewer Bookings', icon: Calendar },
  { id: 'booking-slots', label: 'Booking Slots', icon: Clock },
  { id: 'student-bookings', label: 'Public Links', icon: Link2 },
  { id: 'confirmed-slots', label: 'Confirmed Slots', icon: CheckCircle },
];

const tabComponents = {
  'interviewer-bookings': InterviewBookings,
  'booking-slots': BookingSlots,
  'student-bookings': StudentBookings,
  'confirmed-slots': ConfirmedSlots,
};

const BASE = '/admin/bookings';

const BookingsSidebar = memo(({ activeTab, onTabClick, counts }) => (
  <aside className="w-56 flex-shrink-0 bg-[#f0f4fa] border-r border-slate-200/80 flex flex-col">
    <nav className="flex-1 p-3 space-y-0.5">
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        const count = tab.countKey ? (counts[tab.countKey] || 0) : 0;
        return (
          <button
            key={tab.id}
            onClick={() => onTabClick(tab.id)}
            className={cn(
              'flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150',
              isActive
                ? 'bg-white text-blue-700 shadow-sm border border-slate-200/60'
                : 'text-slate-600 hover:bg-white/70 hover:text-slate-900'
            )}
          >
            <tab.icon className="w-4 h-4" />
            <span className="ml-2.5 flex-1 text-left">{tab.label}</span>
            {count > 0 && (
              <Badge className="ml-auto text-[10px] px-1.5 min-w-[20px] justify-center bg-red-500 text-white border-transparent blinking-count">
                {count}
              </Badge>
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
    <div className="flex h-full w-full overflow-hidden">
      <BookingsSidebar activeTab={activeTab} onTabClick={handleTabClick} counts={counts} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <ActiveComponent key={activeTab} />
      </main>
    </div>
  );
};

export default BookingsPage;
