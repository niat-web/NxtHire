import React, { useState, useCallback, memo } from 'react';
import { Calendar, Clock, Link2, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

import InterviewBookings from './InterviewBookings';
import BookingSlots from './BookingSlots';
import StudentBookings from './StudentBookings';
import ConfirmedSlots from './ConfirmedSlots';

const tabs = [
  { id: 'interviewer-bookings', label: 'Interviewer Bookings', icon: Calendar },
  { id: 'booking-slots', label: 'Booking Slots', icon: Clock },
  { id: 'student-bookings', label: 'Manage Public Links', icon: Link2 },
  { id: 'confirmed-slots', label: 'Confirmed Slots', icon: CheckCircle },
];

const tabComponents = {
  'interviewer-bookings': InterviewBookings,
  'booking-slots': BookingSlots,
  'student-bookings': StudentBookings,
  'confirmed-slots': ConfirmedSlots,
};

const BASE = '/admin/bookings';

const BookingsSidebar = memo(({ activeTab, onTabClick }) => (
  <aside className="w-56 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
    <div className="px-5 py-4 border-b border-gray-100">
      <h2 className="text-base font-semibold text-gray-900">New Interviews</h2>
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
            <span>{tab.label}</span>
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

  const handleTabClick = useCallback((tabId) => {
    setActiveTab(tabId);
    window.history.replaceState(null, '', `${BASE}/${tabId}`);
  }, []);

  const ActiveComponent = tabComponents[activeTab];

  return (
    <div className="flex h-full w-full overflow-hidden">
      <BookingsSidebar activeTab={activeTab} onTabClick={handleTabClick} />
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <ActiveComponent key={activeTab} />
      </main>
    </div>
  );
};

export default BookingsPage;
