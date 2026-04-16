import React, { memo } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Calendar, Clock, Link2, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const bookingsNavItems = [
  { label: 'Interviewer Bookings', path: '/admin/bookings/interviewer-bookings', icon: <Calendar className="w-4 h-4" /> },
  { label: 'Booking Slots', path: '/admin/bookings/booking-slots', icon: <Clock className="w-4 h-4" /> },
  { label: 'Manage Public Links', path: '/admin/bookings/student-bookings', icon: <Link2 className="w-4 h-4" /> },
  { label: 'Confirmed Slots', path: '/admin/bookings/confirmed-slots', icon: <CheckCircle className="w-4 h-4" /> },
];

// Memoized sidebar — never re-renders on route change
const BookingsSidebar = memo(() => (
  <aside className="w-56 flex-shrink-0 bg-[#f0f4fa] border-r border-slate-200/80 flex flex-col">
    <div className="px-5 py-4 border-b border-slate-200/60">
      <h2 className="text-base font-semibold text-slate-900">New Interviews</h2>
    </div>
    <nav className="flex-1 p-3 space-y-0.5">
      {bookingsNavItems.map(item => (
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

BookingsSidebar.displayName = 'BookingsSidebar';

const BookingsLayout = () => (
  <div className="flex h-full w-full overflow-hidden">
    <BookingsSidebar />
    <main className="flex-1 overflow-y-auto bg-[#f5f7fb]">
      <Outlet />
    </main>
  </div>
);

export default BookingsLayout;
