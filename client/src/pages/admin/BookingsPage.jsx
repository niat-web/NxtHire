import React, { useState, useCallback, memo } from 'react';
import { Calendar, Clock, Link2, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useInterviewBookings, usePublicBookings } from '@/hooks/useAdminQueries';

import InterviewBookings from './InterviewBookings';
import BookingSlots from './BookingSlots';
import StudentBookings from './StudentBookings';
import ConfirmedSlots from './ConfirmedSlots';

const DISPLAY = { fontFamily: 'Supreme, "Plus Jakarta Sans", system-ui, sans-serif' };
const ACCENT = '#C0392B';

const tabs = [
  { id: 'interviewer-bookings', label: 'Interviewer bookings', icon: Calendar, countKey: 'openBookings' },
  { id: 'booking-slots',        label: 'Booking slots',         icon: Clock },
  { id: 'student-bookings',     label: 'Public links',          icon: Link2, countKey: 'publicLinks' },
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
  <aside className="w-60 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col">
    <div className="px-6 py-5 border-b border-slate-100">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.2em] text-slate-600">
        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: ACCENT }} />
        Admin
      </span>
      <h2 style={DISPLAY} className="mt-3 text-[22px] font-semibold text-slate-900 tracking-tight leading-none">
        Interviews
      </h2>
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
              'group flex items-center w-full px-3 py-2 text-[13px] font-medium rounded-xl transition-colors',
              isActive
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            )}
          >
            <tab.icon className="w-4 h-4" aria-hidden="true" />
            <span className="ml-2.5 flex-1 text-left">{tab.label}</span>
            {count > 0 && (
              <span
                className={cn(
                  'inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 text-[10px] font-semibold rounded-full',
                  isActive ? 'bg-white text-slate-900' : 'text-white'
                )}
                style={!isActive ? { backgroundColor: ACCENT } : undefined}
              >
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
    <div className="flex h-full w-full overflow-hidden bg-[#fcfaf8]">
      <BookingsSidebar activeTab={activeTab} onTabClick={handleTabClick} counts={counts} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <ActiveComponent key={activeTab} />
      </main>
    </div>
  );
};

export default BookingsPage;
