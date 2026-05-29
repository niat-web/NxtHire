import React, { memo } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Calendar, Clock, Link2, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const DISPLAY = { fontFamily: 'Supreme, "Plus Jakarta Sans", system-ui, sans-serif' };

const bookingsNavItems = [
  { label: 'Interviewer Bookings', path: '/admin/bookings/interviewer-bookings', icon: <Calendar className="w-4 h-4" /> },
  { label: 'Booking Slots', path: '/admin/bookings/booking-slots', icon: <Clock className="w-4 h-4" /> },
  { label: 'Manage Public Links', path: '/admin/bookings/student-bookings', icon: <Link2 className="w-4 h-4" /> },
  { label: 'Confirmed Slots', path: '/admin/bookings/confirmed-slots', icon: <CheckCircle className="w-4 h-4" /> },
];

const BookingsSidebar = memo(() => (
  <aside className="w-60 flex-shrink-0 bg-white border-r border-border flex flex-col">
    <div className="px-6 py-5 border-b border-border">
      <h2 style={DISPLAY} className="text-[20px] font-semibold text-foreground tracking-tight">New Interviews</h2>
    </div>
    <nav className="flex-1 p-3 space-y-0.5">
      {bookingsNavItems.map(item => (
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

BookingsSidebar.displayName = 'BookingsSidebar';

const BookingsLayout = () => (
  <div className="flex h-full w-full overflow-hidden">
    <BookingsSidebar />
    <main className="flex-1 overflow-y-auto bg-[#fcfaf8]">
      <Outlet />
    </main>
  </div>
);

export default BookingsLayout;
