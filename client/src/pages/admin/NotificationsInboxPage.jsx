// client/src/pages/admin/NotificationsInboxPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import {
  Bell, CheckCheck, Calendar, UserCheck, Video, Clock,
  CreditCard, Users, Inbox, ChevronRight, Check, FileText, ClipboardCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDateTime } from '@/utils/formatters';
import Loader from '@/components/common/Loader';

// ── Type config for icons & colors ──
const typeConfig = {
  interviewer_submitted_slots: { icon: UserCheck,      color: 'bg-blue-50 text-blue-600', label: 'Slot Submission' },
  student_booked_slot:         { icon: Calendar,       color: 'bg-emerald-50 text-emerald-600', label: 'Student Booking' },
  meet_link_generated:         { icon: Video,          color: 'bg-amber-50 text-amber-600', label: 'Meet Link' },
  new_applicant:               { icon: Users,          color: 'bg-sky-50 text-sky-600', label: 'New Applicant' },
  payment_confirmed:           { icon: CreditCard,     color: 'bg-green-50 text-green-600', label: 'Payment' },
  skill_assessment_submitted:  { icon: FileText,       color: 'bg-violet-50 text-violet-600', label: 'Skills Review' },
  guidelines_submitted:        { icon: ClipboardCheck, color: 'bg-orange-50 text-orange-600', label: 'Guidelines Review' },
};

const fallbackConfig = { icon: Bell, color: 'bg-slate-50 text-slate-600', label: 'Notification' };

// ── Time ago helper ──
const timeAgo = (date) => {
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

const NotificationsInboxPage = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications } = useSocket();
  const [selectedId, setSelectedId] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'

  // Refresh on mount
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Auto-select first notification
  useEffect(() => {
    if (notifications.length > 0 && !selectedId) {
      setSelectedId(notifications[0]._id);
    }
  }, [notifications, selectedId]);

  const selectedNotification = notifications.find(n => n._id === selectedId);

  const handleSelect = useCallback((n) => {
    setSelectedId(n._id);
    if (!n.isRead) markAsRead(n._id);
  }, [markAsRead]);

  const filtered = filter === 'unread'
    ? notifications.filter(n => !n.isRead)
    : notifications;

  if (!notifications) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="h-full flex overflow-hidden">
      {/* ═══ LEFT: Notification list ═══ */}
      <div className="w-[360px] shrink-0 bg-white border-r border-slate-200 flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-200 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold text-white bg-blue-600 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-800 transition-colors">
                <CheckCheck size={13} /> Mark all read
              </button>
            )}
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1">
            {['all', 'unread'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={cn(
                  'px-3 py-1 text-[11px] font-semibold rounded-md transition-colors capitalize',
                  filter === f
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                )}>
                {f === 'all' ? 'All' : `Unread (${unreadCount})`}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Inbox size={28} className="mb-2 opacity-30" />
              <p className="text-xs font-medium">No notifications</p>
            </div>
          ) : (
            filtered.map((n) => {
              const config = typeConfig[n.type] || fallbackConfig;
              const Icon = config.icon;
              const isSelected = n._id === selectedId;

              return (
                <button
                  key={n._id}
                  onClick={() => handleSelect(n)}
                  className={cn(
                    'w-full flex items-start gap-3 px-4 py-3 text-left transition-colors border-b border-slate-100 last:border-0',
                    isSelected ? 'bg-blue-50/60' : n.isRead ? 'bg-white hover:bg-slate-50' : 'bg-blue-50/20 hover:bg-blue-50/40'
                  )}
                >
                  <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5', config.color)}>
                    <Icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className={cn('text-xs truncate', n.isRead ? 'font-medium text-slate-600' : 'font-semibold text-slate-900')}>
                        {n.title}
                      </p>
                      {!n.isRead && <span className="w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0" />}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{n.message}</p>
                    <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                      <Clock size={9} /> {timeAgo(n.createdAt)}
                    </p>
                  </div>
                  <ChevronRight size={14} className={cn('shrink-0 mt-2 transition-colors', isSelected ? 'text-blue-500' : 'text-slate-300')} />
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ═══ RIGHT: Detail panel ═══ */}
      <div className="flex-1 bg-[#f5f7fb] overflow-y-auto">
        {selectedNotification ? (
          <NotificationDetail notification={selectedNotification} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <Bell size={32} className="mb-3 opacity-20" />
            <p className="text-sm font-medium text-slate-500">Select a notification</p>
            <p className="text-xs text-slate-400 mt-0.5">Click on any notification to view details</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Detail panel ──
const NotificationDetail = ({ notification }) => {
  const config = typeConfig[notification.type] || fallbackConfig;
  const Icon = config.icon;

  return (
    <div className="p-6 max-w-2xl">
      {/* Header card */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-5">
          <div className="flex items-start gap-4">
            <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center shrink-0', config.color)}>
              <Icon size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide', config.color)}>
                  {config.label}
                </span>
                {notification.isRead ? (
                  <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                    <Check size={10} /> Read
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] text-blue-600 font-semibold">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> Unread
                  </span>
                )}
              </div>
              <h2 className="text-lg font-semibold text-slate-900">{notification.title}</h2>
              <p className="text-sm text-slate-500 mt-1 leading-relaxed">{notification.message}</p>
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100">
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Clock size={12} /> {formatDateTime(notification.createdAt)}
            </span>
            <span className="flex items-center gap-1">
              Type: <span className="font-semibold text-slate-700">{notification.type}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Extra data if present */}
      {notification.data && Object.keys(notification.data).length > 0 && (
        <div className="mt-4 bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-3 border-b border-slate-100">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Details</h3>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(notification.data).map(([key, value]) => (
                <div key={key} className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                  </p>
                  <p className="text-sm text-slate-900 font-medium break-words">
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsInboxPage;
