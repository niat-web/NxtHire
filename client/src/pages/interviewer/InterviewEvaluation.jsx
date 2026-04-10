// client/src/pages/interviewer/InterviewEvaluation.jsx
import React, { useState, useEffect, useMemo, useCallback, Fragment } from 'react';
import { updateInterviewStatus } from '../../api/interviewer.api';
import { useAlert } from '../../hooks/useAlert';
import { useAssignedInterviews, useInvalidateInterviewer } from '../../hooks/useInterviewerQueries';
import {
  format as formatDateFns, startOfWeek, endOfWeek, addDays, subDays,
  eachDayOfInterval, isToday, isSameDay, getDay, isPast, isFuture
} from 'date-fns';
import {
  ChevronLeft, ChevronRight, Video, User, FileText, Clock,
  X, CheckCircle, ChevronDown, Calendar, RefreshCw,
  ExternalLink, MapPin
} from 'lucide-react';
import { Dialog, Transition, Listbox } from '@headlessui/react';
import { MAIN_SHEET_INTERVIEW_STATUSES } from '../../utils/constants';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// ─── STATUS CONFIG ───────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  Scheduled:  { bg: 'bg-emerald-50',  border: 'border-emerald-500', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Scheduled' },
  InProgress: { bg: 'bg-amber-50',    border: 'border-amber-500',   text: 'text-amber-700',   dot: 'bg-amber-500',   label: 'In Progress' },
  Completed:  { bg: 'bg-green-50',    border: 'border-green-500',   text: 'text-green-700',   dot: 'bg-green-500',   label: 'Completed' },
  Cancelled:  { bg: 'bg-red-50',      border: 'border-red-500',     text: 'text-red-700',     dot: 'bg-red-500',     label: 'Cancelled' },
  default:    { bg: 'bg-gray-50',     border: 'border-gray-400',    text: 'text-gray-700',    dot: 'bg-gray-400',    label: 'Unknown' }
};

const getConfig = (status) => STATUS_CONFIG[status] || STATUS_CONFIG.default;

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const parseTime = (timeStr) => {
  if (!timeStr) return { hour: 0, minute: 0 };
  const cleaned = timeStr.trim().toUpperCase();
  let hour, minute;
  if (cleaned.includes('AM') || cleaned.includes('PM')) {
    const period = cleaned.includes('PM') ? 'PM' : 'AM';
    const [timePart] = cleaned.split(period);
    const [h, m] = timePart.trim().split(':');
    hour = parseInt(h, 10); minute = m ? parseInt(m, 10) : 0;
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
  } else {
    const [h, m] = cleaned.split(':');
    hour = parseInt(h, 10); minute = m ? parseInt(m, 10) : 0;
  }
  return { hour, minute };
};

const formatDisplayTime = (timeStr) => {
  if (!timeStr || !timeStr.includes(':')) return '';
  const { hour, minute } = parseTime(timeStr);
  return new Date(1970, 0, 1, hour, minute).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
};

// ─── INTERVIEW DETAILS MODAL ────────────────────────────────────────────────
const InterviewDetailsModal = ({ isOpen, onClose, interview, onStatusChange }) => {
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (interview) setStatus(interview.interviewStatus || '');
  }, [interview]);

  if (!interview) return null;
  const config = getConfig(interview.interviewStatus);
  const [startStr, endStr] = (interview.interviewTime || '').split('-').map(t => t.trim());

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">

                {/* Header */}
                <div className="relative bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-5 text-white">
                  <Button variant="ghost" size="icon" onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/10 text-white">
                    <X size={18} />
                  </Button>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center text-lg font-semibold">
                      {getInitials(interview.candidateName)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{interview.candidateName}</h3>
                      <p className="text-sm text-white/70 font-mono">{interview.interviewId}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Badge className={cn("text-xs font-medium", config.bg, config.text)}>
                      {config.label}
                    </Badge>
                    <Badge variant="outline" className="bg-white/15 text-white border-white/20 text-xs">
                      {interview.techStack}
                    </Badge>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-gray-400 mb-2">
                        <Calendar size={14} />
                        <span className="text-xs font-medium uppercase tracking-wide">Date</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatDateFns(new Date(interview.interviewDate), 'MMM do, yyyy')}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-gray-400 mb-2">
                        <Clock size={14} />
                        <span className="text-xs font-medium uppercase tracking-wide">Time</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatDisplayTime(startStr)} - {formatDisplayTime(endStr)}
                      </p>
                      {interview.interviewDuration && (
                        <p className="text-xs text-gray-500 mt-0.5">{interview.interviewDuration}</p>
                      )}
                    </div>
                  </div>

                  {interview.mailId && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-gray-400 mb-2">
                        <User size={14} />
                        <span className="text-xs font-medium uppercase tracking-wide">Contact</span>
                      </div>
                      <p className="text-sm text-gray-700">{interview.mailId}</p>
                    </div>
                  )}

                  {interview.meetingLink && (
                    <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 bg-indigo-50 rounded-xl border border-indigo-100 hover:bg-indigo-100 transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <Video size={18} className="text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-indigo-800">Join Meeting</p>
                          <p className="text-xs text-indigo-600 truncate max-w-[250px]">{interview.meetingLink}</p>
                        </div>
                      </div>
                      <ExternalLink size={16} className="text-indigo-400 group-hover:text-indigo-600 transition-colors" />
                    </a>
                  )}

                  {/* Status Update */}
                  <div className="pt-3 border-t border-gray-100">
                    <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Update Status</label>
                    <div className="relative">
                      <select value={status} onChange={(e) => setStatus(e.target.value)}
                        className="w-full pl-3 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none appearance-none cursor-pointer">
                        {MAIN_SHEET_INTERVIEW_STATUSES.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
                  <Button variant="outline" onClick={onClose} className="rounded-xl">
                    Cancel
                  </Button>
                  <Button variant="success" onClick={() => { if (status !== interview.interviewStatus) onStatusChange(interview._id, status); }} className="rounded-xl">
                    Save Changes
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

// ─── AGENDA CARD (Sidebar) ──────────────────────────────────────────────────
const AgendaCard = ({ interview, onClick }) => {
  const config = getConfig(interview.interviewStatus);
  const [startStr] = (interview.interviewTime || '').split('-').map(t => t.trim());

  return (
    <button onClick={() => onClick(interview)}
      className="w-full text-left p-3.5 rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-md bg-white transition-all group">
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-semibold shrink-0 ${config.bg} ${config.text}`}>
          {getInitials(interview.candidateName)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-indigo-700 transition-colors">
            {interview.candidateName}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-500">{formatDisplayTime(startStr)}</span>
            <span className="w-1 h-1 bg-gray-300 rounded-full" />
            <span className="text-xs text-gray-500 truncate">{interview.techStack}</span>
          </div>
        </div>
        <span className={`shrink-0 w-2 h-2 rounded-full mt-2 ${config.dot}`} title={config.label} />
      </div>
      {interview.meetingLink && (
        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-indigo-600 font-medium">
          <Video size={12} />
          <span>Meeting link available</span>
        </div>
      )}
    </button>
  );
};

// ─── STAT PILL ──────────────────────────────────────────────────────────────
const StatPill = ({ label, count, dotColor }) => (
  <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-gray-100 text-xs">
    <span className={`w-2 h-2 rounded-full ${dotColor}`} />
    <span className="text-gray-500 font-medium">{label}</span>
    <span className="font-semibold text-gray-900">{count}</span>
  </div>
);

// ─── FILTER DROPDOWN ────────────────────────────────────────────────────────
const FilterListbox = ({ value, onChange, options, label, icon: Icon }) => (
  <Listbox value={value} onChange={onChange} multiple>
    <div className="relative">
      <Listbox.Button className="relative cursor-pointer rounded-xl bg-white py-2 pl-9 pr-8 text-left border border-gray-200 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm font-medium text-gray-700 min-w-[140px]">
        <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-gray-400"><Icon size={15} /></span>
        <span className="block truncate">
          {value.length > 0 ? `${value.length} selected` : label}
        </span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-2"><ChevronDown size={14} className="text-gray-400" /></span>
      </Listbox.Button>
      <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
        <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-sm shadow-xl ring-1 ring-black/5 z-50 focus:outline-none">
          {options.map((opt) => (
            <Listbox.Option key={opt.value} value={opt.value}
              className={({ active }) => cn("relative cursor-pointer select-none py-2.5 pl-9 pr-4", active ? "bg-indigo-50 text-indigo-900" : "text-gray-600")}>
              {({ selected }) => (
                <>
                  <span className={cn("block truncate", selected && "font-semibold text-gray-900")}>{opt.label}</span>
                  {selected && <CheckCircle className="absolute left-2.5 top-1/2 -translate-y-1/2 text-indigo-600" size={14} />}
                </>
              )}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </Transition>
    </div>
  </Listbox>
);

// ─── CALENDAR GRID ──────────────────────────────────────────────────────────
const CalendarGrid = ({ weekDays, scheduledInterviews, onEventClick }) => {
  const hours = Array.from({ length: 15 }, (_, i) => i + 8);
  const rowHeight = 70;

  return (
    <div className="flex-1 overflow-auto relative bg-white rounded-2xl border border-gray-200">
      <div className="grid" style={{ gridTemplateColumns: '56px repeat(7, 1fr)', gridTemplateRows: `48px repeat(${hours.length}, ${rowHeight}px)`, minWidth: '900px' }}>

        {/* Header Corner */}
        <div className="sticky top-0 left-0 bg-gray-50 z-30 border-b border-r border-gray-200 flex items-center justify-center rounded-tl-2xl">
          <Clock size={14} className="text-gray-300" />
        </div>

        {/* Day Headers */}
        {weekDays.map((day, i) => {
          const isCurrent = isToday(day);
          return (
            <div key={day.toString()} className={cn("sticky top-0 text-center border-b border-r border-gray-100 z-20 flex flex-col justify-center py-2 backdrop-blur-sm", isCurrent ? "bg-indigo-50/60" : "bg-gray-50/80", i === 6 && "rounded-tr-2xl")}>
              <span className={cn("text-xs font-medium uppercase tracking-widest", isCurrent ? "text-indigo-600" : "text-gray-400")}>
                {formatDateFns(day, 'EEE')}
              </span>
              <div className={cn("mx-auto w-7 h-7 flex items-center justify-center rounded-full text-xs font-semibold mt-0.5 transition-colors", isCurrent ? "bg-indigo-600 text-white" : "text-gray-800")}>
                {formatDateFns(day, 'd')}
              </div>
            </div>
          );
        })}

        {/* Grid Body */}
        {hours.map((hour, hourIndex) => (
          <React.Fragment key={hour}>
            <div className="text-right pr-2 pt-1.5 text-xs font-medium text-gray-400 border-r border-gray-100 bg-white sticky left-0 z-10"
              style={{ gridRow: hourIndex + 2 }}>
              {formatDateFns(new Date(0, 0, 0, hour), 'h a')}
            </div>
            {weekDays.map((day, dayIndex) => (
              <div key={dayIndex}
                className={cn("border-b border-r border-gray-50 relative transition-colors", isToday(day) ? "bg-indigo-50/20" : "hover:bg-gray-50/50")}
                style={{ gridRow: hourIndex + 2, gridColumn: dayIndex + 2 }}>
                <div className="absolute top-1/2 w-full border-t border-dashed border-gray-100/60" />
              </div>
            ))}
          </React.Fragment>
        ))}

        {/* Event Cards */}
        {scheduledInterviews.map(({ interview, position }) => {
          const config = getConfig(interview.interviewStatus);
          const [startStr, endStr] = (interview.interviewTime || '').split('-').map(t => t.trim());
          return (
            <div key={interview._id} className="relative" style={{ gridColumn: position.column + 2, gridRow: 2 }}>
              <button onClick={() => onEventClick(interview)}
                className={`absolute inset-x-0.5 rounded-lg border-l-[3px] ${config.border} ${config.bg} hover:shadow-lg transition-all overflow-hidden text-left px-2 py-1.5 z-10 group`}
                style={{ top: `${position.top}px`, height: `${Math.max(position.height, 28)}px` }}>
                <p className={`text-xs font-semibold truncate ${config.text}`}>{interview.candidateName}</p>
                {position.height > 35 && (
                  <p className={`text-xs truncate mt-0.5 opacity-75 ${config.text}`}>
                    {formatDisplayTime(startStr)} · {interview.techStack}
                  </p>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── EMPTY STATE ────────────────────────────────────────────────────────────
const EmptyState = ({ onRefresh }) => (
  <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center">
    <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mb-5">
      <Calendar size={32} className="text-indigo-300" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-1.5">No Interviews This Week</h3>
    <p className="text-sm text-gray-500 max-w-xs mb-6">There are no interviews scheduled for this week matching your current filters.</p>
    <Button onClick={onRefresh} variant="success" className="rounded-xl">
      <RefreshCw size={14} className="mr-2" /> Refresh
    </Button>
  </div>
);

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────
const InterviewEvaluation = () => {
  const { showSuccess, showError } = useAlert();
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [filters, setFilters] = useState({ domain: [], status: [] });
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: allInterviews = [], isLoading: loading, refetch } = useAssignedInterviews();
  const { invalidateInterviews } = useInvalidateInterviewer();

  const domains = useMemo(() => [...new Set(allInterviews.map(i => i.techStack).filter(Boolean))], [allInterviews]);

  const weekDays = useMemo(() =>
    eachDayOfInterval({ start: startOfWeek(currentWeekStart, { weekStartsOn: 1 }), end: endOfWeek(currentWeekStart, { weekStartsOn: 1 }) }),
    [currentWeekStart]
  );

  const scheduledInterviews = useMemo(() => {
    const weekStart = currentWeekStart;
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    const hourHeight = 70;

    return allInterviews
      .filter(item => {
        if (!item.interviewDate) return false;
        const d = new Date(item.interviewDate);
        if (d < weekStart || d > weekEnd) return false;
        if (filters.domain.length > 0 && !filters.domain.includes(item.techStack)) return false;
        if (filters.status.length > 0 && !filters.status.includes(item.interviewStatus)) return false;
        return true;
      })
      .map(interview => {
        const d = new Date(interview.interviewDate);
        const dayOfWeek = (getDay(d) + 6) % 7;
        const startTimeStr = (interview.interviewTime || '00:00').split('-')[0].trim();
        const { hour: startHour, minute: startMinute } = parseTime(startTimeStr);
        let durationMinutes = 60;
        if (interview.interviewDuration?.includes('mins')) durationMinutes = parseInt(interview.interviewDuration.replace(' mins', ''));
        return {
          interview,
          position: {
            top: (startHour - 8 + startMinute / 60) * hourHeight,
            height: (durationMinutes / 60) * hourHeight,
            column: dayOfWeek
          }
        };
      });
  }, [allInterviews, currentWeekStart, filters]);

  // Stats for the week
  const weekStats = useMemo(() => {
    const counts = { Scheduled: 0, InProgress: 0, Completed: 0, Cancelled: 0 };
    scheduledInterviews.forEach(({ interview }) => {
      if (counts[interview.interviewStatus] !== undefined) counts[interview.interviewStatus]++;
    });
    return counts;
  }, [scheduledInterviews]);

  // Today's agenda
  const todayAgenda = useMemo(() => {
    return allInterviews
      .filter(i => i.interviewDate && isSameDay(new Date(i.interviewDate), new Date()))
      .sort((a, b) => {
        const aTime = parseTime((a.interviewTime || '').split('-')[0]);
        const bTime = parseTime((b.interviewTime || '').split('-')[0]);
        return (aTime.hour * 60 + aTime.minute) - (bTime.hour * 60 + bTime.minute);
      });
  }, [allInterviews]);

  const handleStatusChange = useCallback(async (entryId, newStatus) => {
    try {
      await updateInterviewStatus(entryId, newStatus);
      invalidateInterviews();
      setSelectedInterview(prev => prev ? { ...prev, interviewStatus: newStatus } : null);
      showSuccess('Status updated!');
      setIsModalOpen(false);
    } catch {
      showError('Failed to update status.');
    }
  }, [showSuccess, showError, invalidateInterviews]);

  const handleEventClick = useCallback((interview) => {
    setSelectedInterview(interview);
    setIsModalOpen(true);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-[#F5F7F9]">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-indigo-500 rounded-full animate-spin mb-4" />
        <span className="text-sm font-semibold text-gray-500">Loading Schedule...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#F5F7F9] overflow-hidden">

      {/* ─── TOP BAR ────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 px-5 py-3.5 flex-shrink-0 z-40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">

          {/* Left: Title + Week Nav */}
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Schedule</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                {formatDateFns(weekDays[0], 'MMM d')} – {formatDateFns(weekDays[6], 'MMM d, yyyy')}
              </p>
            </div>
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
              <Button variant="ghost" size="icon" onClick={() => setCurrentWeekStart(s => subDays(s, 7))} className="p-1.5 rounded-lg hover:bg-white hover:shadow-md text-gray-500 hover:text-gray-900">
                <ChevronLeft size={14} />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
                className="px-2.5 py-1 text-xs font-medium text-gray-600 hover:text-gray-900">
                Today
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setCurrentWeekStart(s => addDays(s, 7))} className="p-1.5 rounded-lg hover:bg-white hover:shadow-md text-gray-500 hover:text-gray-900">
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>

          {/* Right: Stats + Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="hidden md:flex items-center gap-1.5 mr-2">
              <StatPill label="Scheduled" count={weekStats.Scheduled} dotColor="bg-emerald-500" />
              <StatPill label="Completed" count={weekStats.Completed} dotColor="bg-green-500" />
              <StatPill label="Cancelled" count={weekStats.Cancelled} dotColor="bg-red-500" />
            </div>
            <FilterListbox label="All Domains" icon={MapPin} value={filters.domain} options={domains.map(d => ({ value: d, label: d }))} onChange={(v) => setFilters(p => ({ ...p, domain: v }))} />
            <FilterListbox label="All Statuses" icon={CheckCircle} value={filters.status} options={MAIN_SHEET_INTERVIEW_STATUSES} onChange={(v) => setFilters(p => ({ ...p, status: v }))} />
            <Button variant="outline" size="icon" onClick={() => refetch()} className="p-2 rounded-xl text-gray-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50" title="Refresh">
              <RefreshCw size={15} />
            </Button>
          </div>
        </div>
      </div>

      {/* ─── MAIN CONTENT: Calendar + Sidebar ───────────────────────────── */}
      <div className="flex-1 overflow-hidden flex gap-4 p-4">

        {/* Calendar Grid */}
        <div className="flex-1 flex flex-col min-w-0">
          {scheduledInterviews.length > 0 ? (
            <CalendarGrid weekDays={weekDays} scheduledInterviews={scheduledInterviews} onEventClick={handleEventClick} />
          ) : (
            <EmptyState onRefresh={() => refetch()} />
          )}
        </div>

        {/* Right Sidebar: Today's Agenda */}
        <div className="hidden xl:flex flex-col w-72 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-200 flex flex-col h-full overflow-hidden">
            <div className="px-4 py-3.5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Today's Agenda</h3>
                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                  {todayAgenda.length}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">{formatDateFns(new Date(), 'EEEE, MMM d')}</p>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {todayAgenda.length > 0 ? (
                todayAgenda.map(interview => (
                  <AgendaCard key={interview._id} interview={interview} onClick={handleEventClick} />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-3">
                    <Calendar size={20} className="text-gray-300" />
                  </div>
                  <p className="text-xs font-semibold text-gray-500">No interviews today</p>
                  <p className="text-xs text-gray-400 mt-1">Enjoy your free day!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── LEGEND ─────────────────────────────────────────────────────── */}
      <div className="bg-white border-t border-gray-100 px-5 py-2 flex-shrink-0 flex items-center gap-5 text-xs text-gray-400">
        {Object.entries(STATUS_CONFIG).filter(([k]) => k !== 'default').map(([key, c]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${c.dot}`} />
            <span>{c.label}</span>
          </div>
        ))}
      </div>

      <InterviewDetailsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} interview={selectedInterview} onStatusChange={handleStatusChange} />
    </div>
  );
};

export default InterviewEvaluation;
