import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { FiCalendar, FiClock, FiLink, FiCheckCircle } from 'react-icons/fi';

const bookingsNavItems = [
    { label: 'Interviewer Bookings', path: '/admin/bookings/interviewer-bookings', icon: <FiCalendar className="w-4 h-4" /> },
    { label: 'Booking Slots', path: '/admin/bookings/booking-slots', icon: <FiClock className="w-4 h-4" /> },
    { label: 'Manage Public Links', path: '/admin/bookings/student-bookings', icon: <FiLink className="w-4 h-4" /> },
    { label: 'Confirmed Slots', path: '/admin/bookings/confirmed-slots', icon: <FiCheckCircle className="w-4 h-4" /> },
];

const BookingsLayout = () => (
  <div className="flex h-full w-full overflow-hidden">
    <aside className="w-56 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="text-base font-bold text-gray-900">New Interviews</h2>
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {bookingsNavItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-slate-900 text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
    <main className="flex-1 overflow-y-auto bg-gray-50">
      <Outlet />
    </main>
  </div>
);

export default BookingsLayout;
