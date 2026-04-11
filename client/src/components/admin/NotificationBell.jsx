import { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, Calendar, UserCheck, Video, Clock } from 'lucide-react';
import { useSocket } from '../../contexts/SocketContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const typeConfig = {
  interviewer_submitted_slots: { icon: UserCheck, color: 'bg-indigo-50 text-indigo-600' },
  student_booked_slot:         { icon: Calendar,  color: 'bg-emerald-50 text-emerald-600' },
  meet_link_generated:         { icon: Video,     color: 'bg-amber-50 text-amber-600' },
  new_applicant:               { icon: UserCheck,  color: 'bg-sky-50 text-sky-600' },
  payment_confirmed:           { icon: CheckCheck, color: 'bg-green-50 text-green-600' },
};

const timeAgo = (date) => {
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useSocket();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[10px] font-bold text-white bg-red-500 rounded-full leading-none animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-[70]">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <p className="text-[10px] text-gray-400">{unreadCount} unread</p>
              )}
            </div>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs text-indigo-600 hover:text-indigo-800 h-7">
                <CheckCheck size={13} className="mr-1" /> Mark all read
              </Button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[360px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <Bell size={24} className="mb-2 opacity-30" />
                <p className="text-xs">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => {
                const config = typeConfig[n.type] || typeConfig.new_applicant;
                const Icon = config.icon;
                return (
                  <button
                    key={n._id}
                    onClick={() => { if (!n.isRead) markAsRead(n._id); }}
                    className={cn(
                      'w-full flex items-start gap-3 px-4 py-3 text-left transition-colors border-b border-gray-50 last:border-0',
                      n.isRead ? 'bg-white hover:bg-gray-50' : 'bg-indigo-50/30 hover:bg-indigo-50/50'
                    )}
                  >
                    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5', config.color)}>
                      <Icon size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={cn('text-xs font-semibold truncate', n.isRead ? 'text-gray-700' : 'text-gray-900')}>
                          {n.title}
                        </p>
                        {!n.isRead && <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full shrink-0" />}
                      </div>
                      <p className="text-[11px] text-gray-500 truncate mt-0.5">{n.message}</p>
                      <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                        <Clock size={9} /> {timeAgo(n.createdAt)}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
