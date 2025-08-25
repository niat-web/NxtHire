import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { FiCalendar, FiClock, FiLink, FiCheckCircle } from 'react-icons/fi';

const bookingsNavItems = [
    { label: 'Interviewer Bookings', path: '/admin/bookings/interviewer-bookings', icon: <FiCalendar className="w-5 h-5" /> },
    { label: 'Booking Slots', path: '/admin/bookings/booking-slots', icon: <FiClock className="w-5 h-5" /> },
    { label: 'Manage Public Links', path: '/admin/bookings/student-bookings', icon: <FiLink className="w-5 h-5" /> },
    { label: 'Confirmed Slots', path: '/admin/bookings/confirmed-slots', icon: <FiCheckCircle className="w-5 h-5" /> },
];

const BookingsLayout = () => {
  return (
    <div className="flex h-full w-full bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      {/* Left Sub-navigation */}
      <aside className="w-64 flex-shrink-0 bg-gray-50 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-800">New Interviews</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {bookingsNavItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                }`
              }
            >
              {item.icon}
              <span className="ml-3">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content Area for Nested Routes */}
      <main className="flex-1 overflow-y-auto">
        <div className="h-full">
            <Outlet />
        </div>
      </main>
    </div>
  );
};

export default BookingsLayout;