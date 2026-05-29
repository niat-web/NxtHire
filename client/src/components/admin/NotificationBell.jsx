import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, Calendar, UserCheck, Video, Clock, ArrowRight, FileText, ClipboardCheck } from 'lucide-react';
import { useSocket } from '../../contexts/SocketContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const typeConfig = {
  interviewer_submitted_slots: { icon: UserCheck },
  student_booked_slot:         { icon: Calendar },
  meet_link_generated:         { icon: Video },
  new_applicant:               { icon: UserCheck },
  payment_confirmed:           { icon: CheckCheck },
  skill_assessment_submitted:  { icon: FileText },
  guidelines_submitted:        { icon: ClipboardCheck },
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
      <button
        onClick={() => setOpen(!open)}
        className="relative h-10 w-10 inline-flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span
            className="absolute top-1 right-1 min-w-[16px] h-[16px] flex items-center justify-center px-1 text-[9.5px] font-semibold text-white rounded-full leading-none"
            style={{ backgroundColor: '#C0392B' }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-border overflow-hidden z-[70]">
          <div className="px-4 py-3.5 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="text-[13px] font-semibold text-foreground tracking-tight">Notifications</h3>
              {unreadCount > 0 && (
                <p className="text-[10.5px] text-muted-foreground mt-0.5">{unreadCount} unread</p>
              )}
            </div>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-[11.5px] text-foreground/90 hover:text-foreground h-7 px-2.5">
                <CheckCheck size={12} className="mr-1" /> Mark all read
              </Button>
            )}
          </div>

          <div className="max-h-[360px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground/40">
                <Bell size={22} className="mb-2" />
                <p className="text-[12px] text-muted-foreground">No notifications yet</p>
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
                      'w-full flex items-start gap-3 px-4 py-3 text-left transition-colors border-b border-border last:border-0',
                      n.isRead ? 'bg-white hover:bg-muted/30' : 'bg-muted/40/50 hover:bg-muted/40'
                    )}
                  >
                    <div className="w-8 h-8 rounded-full border border-border bg-white flex items-center justify-center shrink-0 mt-0.5 text-foreground/90">
                      <Icon size={13} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={cn('text-[12.5px] font-semibold truncate', n.isRead ? 'text-foreground/90' : 'text-foreground')}>
                          {n.title}
                        </p>
                        {!n.isRead && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: '#C0392B' }} />}
                      </div>
                      <p className="text-[11.5px] text-muted-foreground truncate mt-0.5">{n.message}</p>
                      <p className="text-[10.5px] text-muted-foreground/70 mt-1 flex items-center gap-1">
                        <Clock size={9} /> {timeAgo(n.createdAt)}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <Link
            to="/admin/notifications-inbox"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-1.5 px-4 py-3 border-t border-border text-[12px] font-semibold text-foreground hover:bg-muted/30 transition-colors"
          >
            View All Notifications <ArrowRight size={12} />
          </Link>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
