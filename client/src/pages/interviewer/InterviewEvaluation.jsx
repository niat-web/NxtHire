// client/src/pages/interviewer/InterviewEvaluation.jsx
import React, { useState, useEffect, useMemo, useCallback, Fragment } from 'react';
import { updateInterviewStatus } from '../../api/interviewer.api';
import { useAlert } from '../../hooks/useAlert';
import { useAssignedInterviews, useInvalidateInterviewer } from '../../hooks/useInterviewerQueries';
import {
  format as formatDateFns, startOfWeek, endOfWeek, addDays, subDays,
  eachDayOfInterval, isToday, isSameDay, isPast, isFuture
} from 'date-fns';
import {
  ChevronLeft, ChevronRight, Video, User, Clock,
  X, CheckCircle, ChevronDown, Calendar, RefreshCw,
  ExternalLink, MapPin, Inbox, Filter, List, LayoutGrid
} from 'lucide-react';
import { Dialog, Transition, Listbox } from '@headlessui/react';
import { MAIN_SHEET_INTERVIEW_STATUSES } from '../../utils/constants';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Loader from '@/components/common/Loader';

// ─── STATUS CONFIG ───────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  Scheduled:  { bg: 'bg-blue-50',   border: 'border-blue-500', text: 'text-blue-700', dot: 'bg-blue-500', pill: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Scheduled' },
  InProgress: { bg: 'bg-amber-50',    border: 'border-amber-500',  text: 'text-amber-700',  dot: 'bg-amber-500',  pill: 'bg-amber-50 text-amber-700 border-amber-200',   label: 'In Progress' },
  Completed:  { bg: 'bg-emerald-50',  border: 'border-emerald-500',text: 'text-emerald-700',dot: 'bg-emerald-500',pill: 'bg-emerald-50 text-emerald-700 border-emerald-200',label: 'Completed' },
  Cancelled:  { bg: 'bg-red-50',      border: 'border-red-500',    text: 'text-red-700',    dot: 'bg-red-500',    pill: 'bg-red-50 text-red-700 border-red-200',           label: 'Cancelled' },
  default:    { bg: 'bg-gray-50',     border: 'border-gray-400',   text: 'text-gray-700',   dot: 'bg-gray-400',   pill: 'bg-gray-50 text-gray-600 border-gray-200',        label: 'Unknown' }
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

// ─── STAT CARD ──────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, color = 'blue', active, onClick }) => {
  const palette = {
    blue:    { bg: 'bg-blue-50 text-blue-600', ring: 'ring-blue-200' },
    amber:   { bg: 'bg-amber-50 text-amber-600',   ring: 'ring-amber-200' },
    emerald: { bg: 'bg-emerald-50 text-emerald-600',ring: 'ring-emerald-200' },
    red:     { bg: 'bg-red-50 text-red-600',        ring: 'ring-red-200' },
  };
  const c = palette[color];
  return (
    <button onClick={onClick}
      className={cn(
        'rounded-xl border bg-white p-3.5 text-left transition-all duration-200 flex-1 min-w-[120px]',
        active ? `border-transparent ring-2 ${c.ring} shadow-sm` : 'border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200'
      )}>
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
        <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center', c.bg)}>
          <Icon size={14} />
        </div>
      </div>
      <p className="text-xl font-bold text-gray-900">{value}</p>
    </button>
  );
};

// ─── INTERVIEW CARD (list view) ─────────────────────────────────────────────
const InterviewCard = ({ interview, onClick }) => {
  const config = getConfig(interview.interviewStatus);
  const [startStr, endStr] = (interview.interviewTime || '').split('-').map(t => t.trim());
  const isPastDate = isPast(new Date(interview.interviewDate)) && !isToday(new Date(interview.interviewDate));

  return (
    <button onClick={() => onClick(interview)}
      className={cn(
        'w-full text-left bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md hover:border-gray-200 transition-all duration-200 group',
        isPastDate && 'opacity-60'
      )}>
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shrink-0', config.bg, config.text)}>
          {getInitials(interview.candidateName)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
              {interview.candidateName}
            </p>
            <span className={cn('inline-flex items-center px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase', config.pill)}>
              {config.label}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Clock size={11} /> {formatDisplayTime(startStr)}{endStr ? ` – ${formatDisplayTime(endStr)}` : ''}
            </span>
            {interview.techStack && (
              <>
                <span className="w-1 h-1 bg-gray-300 rounded-full" />
                <span>{interview.techStack}</span>
              </>
            )}
            {interview.interviewId && (
              <>
                <span className="w-1 h-1 bg-gray-300 rounded-full" />
                <span className="font-mono">{interview.interviewId}</span>
              </>
            )}
          </div>
        </div>

        {/* Meeting link */}
        {interview.meetingLink && (
          <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="shrink-0 flex items-center gap-2 px-3 h-8 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 border border-blue-100 transition-colors">
            <Video size={13} /> Join
          </a>
        )}
      </div>
    </button>
  );
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
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-xl bg-white shadow-xl transition-all">
                {/* Header */}
                <div className="relative bg-blue-600 px-6 py-5 text-white">
                  <Button variant="ghost" size="icon" onClick={onClose} className="absolute top-4 right-4 rounded-full hover:bg-white/10 text-white">
                    <X size={18} />
                  </Button>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center text-lg font-bold">
                      {getInitials(interview.candidateName)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{interview.candidateName}</h3>
                      <p className="text-sm text-white/60 font-mono">{interview.interviewId}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold", config.bg, config.text)}>{config.label}</span>
                    {interview.techStack && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-white/15 text-white text-xs font-medium">{interview.techStack}</span>
                    )}
                  </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Date</p>
                      <p className="text-sm font-semibold text-gray-900">{formatDateFns(new Date(interview.interviewDate), 'MMM do, yyyy')}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Time</p>
                      <p className="text-sm font-semibold text-gray-900">{formatDisplayTime(startStr)} – {formatDisplayTime(endStr)}</p>
                      {interview.interviewDuration && <p className="text-xs text-gray-400 mt-0.5">{interview.interviewDuration}</p>}
                    </div>
                  </div>

                  {interview.mailId && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Contact</p>
                      <p className="text-sm text-gray-700">{interview.mailId}</p>
                    </div>
                  )}

                  {interview.meetingLink && (
                    <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Video size={18} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-blue-800">Join Meeting</p>
                          <p className="text-xs text-blue-500 truncate max-w-[240px]">{interview.meetingLink}</p>
                        </div>
                      </div>
                      <ExternalLink size={16} className="text-blue-400 group-hover:text-blue-600 transition-colors" />
                    </a>
                  )}

                  {/* Status Update */}
                  <div className="pt-3 border-t border-gray-100">
                    <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Update Status</label>
                    <div className="relative">
                      <select value={status} onChange={(e) => setStatus(e.target.value)}
                        className="w-full pl-3 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none appearance-none cursor-pointer">
                        {MAIN_SHEET_INTERVIEW_STATUSES.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
                  <Button variant="outline" onClick={onClose} size="sm">Cancel</Button>
                  <Button onClick={() => { if (status !== interview.interviewStatus) onStatusChange(interview._id, status); }} size="sm">
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

// ─── FILTER DROPDOWN ────────────────────────────────────────────────────────
const FilterListbox = ({ value, onChange, options, label, icon: Icon }) => (
  <Listbox value={value} onChange={onChange} multiple>
    <div className="relative">
      <Listbox.Button className="relative cursor-pointer rounded-lg bg-white py-2 pl-8 pr-7 text-left border border-gray-200 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-sm font-medium text-gray-700 min-w-[130px]">
        <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-gray-400"><Icon size={14} /></span>
        <span className="block truncate">{value.length > 0 ? `${value.length} selected` : label}</span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-2"><ChevronDown size={13} className="text-gray-400" /></span>
      </Listbox.Button>
      <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
        <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-sm shadow-xl ring-1 ring-black/5 z-50 focus:outline-none">
          {options.map((opt) => (
            <Listbox.Option key={opt.value} value={opt.value}
              className={({ active }) => cn("relative cursor-pointer select-none py-2.5 pl-9 pr-4", active ? "bg-blue-50 text-blue-900" : "text-gray-600")}>
              {({ selected }) => (
                <>
                  <span className={cn("block truncate", selected && "font-semibold text-gray-900")}>{opt.label}</span>
                  {selected && <CheckCircle className="absolute left-2.5 top-1/2 -translate-y-1/2 text-blue-600" size={14} />}
                </>
              )}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </Transition>
    </div>
  </Listbox>
);

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────
const InterviewEvaluation = () => {
  const { showSuccess, showError } = useAlert();
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [filters, setFilters] = useState({ domain: [], status: [] });
  const [statusFilter, setStatusFilter] = useState(null); // single status filter from stat cards
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: allInterviews = [], isLoading: loading, refetch } = useAssignedInterviews();
  const { invalidateInterviews } = useInvalidateInterviewer();

  const domains = useMemo(() => [...new Set(allInterviews.map(i => i.techStack).filter(Boolean))], [allInterviews]);

  const weekDays = useMemo(() =>
    eachDayOfInterval({ start: startOfWeek(currentWeekStart, { weekStartsOn: 1 }), end: endOfWeek(currentWeekStart, { weekStartsOn: 1 }) }),
    [currentWeekStart]
  );

  // Filter interviews for current week
  const weekInterviews = useMemo(() => {
    const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
    return allInterviews.filter(item => {
      if (!item.interviewDate) return false;
      const d = new Date(item.interviewDate);
      if (d < currentWeekStart || d > weekEnd) return false;
      if (filters.domain.length > 0 && !filters.domain.includes(item.techStack)) return false;
      if (filters.status.length > 0 && !filters.status.includes(item.interviewStatus)) return false;
      if (statusFilter && item.interviewStatus !== statusFilter) return false;
      return true;
    }).sort((a, b) => {
      const dateA = new Date(a.interviewDate);
      const dateB = new Date(b.interviewDate);
      if (dateA.getTime() !== dateB.getTime()) return dateA - dateB;
      const tA = parseTime((a.interviewTime || '').split('-')[0]);
      const tB = parseTime((b.interviewTime || '').split('-')[0]);
      return (tA.hour * 60 + tA.minute) - (tB.hour * 60 + tB.minute);
    });
  }, [allInterviews, currentWeekStart, filters, statusFilter]);

  // Stats for the week (before statusFilter)
  const weekStats = useMemo(() => {
    const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
    const weekAll = allInterviews.filter(item => {
      if (!item.interviewDate) return false;
      const d = new Date(item.interviewDate);
      return d >= currentWeekStart && d <= weekEnd;
    });
    return {
      total: weekAll.length,
      Scheduled: weekAll.filter(i => i.interviewStatus === 'Scheduled').length,
      Completed: weekAll.filter(i => i.interviewStatus === 'Completed').length,
      Cancelled: weekAll.filter(i => i.interviewStatus === 'Cancelled').length,
      InProgress: weekAll.filter(i => i.interviewStatus === 'InProgress').length,
    };
  }, [allInterviews, currentWeekStart]);

  // Group by day for list view
  const groupedByDay = useMemo(() => {
    const groups = {};
    weekDays.forEach(day => {
      const key = formatDateFns(day, 'yyyy-MM-dd');
      groups[key] = { date: day, interviews: [] };
    });
    weekInterviews.forEach(interview => {
      const key = formatDateFns(new Date(interview.interviewDate), 'yyyy-MM-dd');
      if (groups[key]) groups[key].interviews.push(interview);
    });
    return Object.values(groups).filter(g => g.interviews.length > 0);
  }, [weekInterviews, weekDays]);

  const handleStatusChange = useCallback(async (entryId, newStatus) => {
    try {
      await updateInterviewStatus(entryId, newStatus);
      invalidateInterviews();
      setSelectedInterview(prev => prev ? { ...prev, interviewStatus: newStatus } : null);
      showSuccess('Status updated!');
      setIsModalOpen(false);
    } catch { showError('Failed to update status.'); }
  }, [showSuccess, showError, invalidateInterviews]);

  const handleEventClick = useCallback((interview) => {
    setSelectedInterview(interview);
    setIsModalOpen(true);
  }, []);

  const toggleStatusFilter = (s) => setStatusFilter(prev => prev === s ? null : s);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ─── HEADER ─────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shrink-0 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Scheduled Interviews</h1>
              <p className="text-xs text-gray-400 mt-0.5">
                {formatDateFns(weekDays[0], 'MMM d')} – {formatDateFns(weekDays[6], 'MMM d, yyyy')}
              </p>
            </div>
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
              <Button variant="ghost" size="icon" onClick={() => setCurrentWeekStart(s => subDays(s, 7))} className="h-8 w-8 rounded-md hover:bg-white hover:shadow-sm text-gray-500">
                <ChevronLeft size={14} />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
                className="px-3 h-8 text-xs font-semibold text-gray-600 hover:text-gray-900 rounded-md hover:bg-white hover:shadow-sm">
                Today
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setCurrentWeekStart(s => addDays(s, 7))} className="h-8 w-8 rounded-md hover:bg-white hover:shadow-sm text-gray-500">
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <FilterListbox label="Domains" icon={MapPin} value={filters.domain} options={domains.map(d => ({ value: d, label: d }))} onChange={(v) => setFilters(p => ({ ...p, domain: v }))} />
            <FilterListbox label="Statuses" icon={Filter} value={filters.status} options={MAIN_SHEET_INTERVIEW_STATUSES} onChange={(v) => setFilters(p => ({ ...p, status: v }))} />
            <Button variant="outline" size="icon" onClick={() => refetch()} className="h-9 w-9 rounded-lg text-gray-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50" title="Refresh">
              <RefreshCw size={14} />
            </Button>
          </div>
        </div>
      </div>

      {/* ─── CONTENT ────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Stat Cards — clickable to filter */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <StatCard label="This Week" value={weekStats.total} icon={Calendar} color="blue" active={!statusFilter} onClick={() => setStatusFilter(null)} />
            <StatCard label="Scheduled" value={weekStats.Scheduled} icon={Clock} color="blue" active={statusFilter === 'Scheduled'} onClick={() => toggleStatusFilter('Scheduled')} />
            <StatCard label="In Progress" value={weekStats.InProgress} icon={RefreshCw} color="amber" active={statusFilter === 'InProgress'} onClick={() => toggleStatusFilter('InProgress')} />
            <StatCard label="Completed" value={weekStats.Completed} icon={CheckCircle} color="emerald" active={statusFilter === 'Completed'} onClick={() => toggleStatusFilter('Completed')} />
            <StatCard label="Cancelled" value={weekStats.Cancelled} icon={X} color="red" active={statusFilter === 'Cancelled'} onClick={() => toggleStatusFilter('Cancelled')} />
          </div>

          {/* Day-grouped list */}
          {groupedByDay.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Calendar className="h-7 w-7 text-gray-300" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">No Interviews This Week</h3>
              <p className="text-sm text-gray-500 max-w-xs mb-5">
                {statusFilter
                  ? `No ${STATUS_CONFIG[statusFilter]?.label.toLowerCase()} interviews found. Try clearing the filter.`
                  : 'There are no interviews scheduled for this week.'}
              </p>
              {statusFilter ? (
                <Button variant="outline" size="sm" onClick={() => setStatusFilter(null)}>Clear Filter</Button>
              ) : (
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  <RefreshCw size={13} className="mr-1.5" /> Refresh
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {groupedByDay.map(({ date, interviews }) => (
                <div key={date.toString()}>
                  {/* Day header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className={cn(
                      'w-10 h-10 rounded-xl flex flex-col items-center justify-center shrink-0 border',
                      isToday(date) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200'
                    )}>
                      <span className="text-[9px] font-bold uppercase leading-none">{formatDateFns(date, 'EEE')}</span>
                      <span className="text-sm font-black leading-none">{formatDateFns(date, 'd')}</span>
                    </div>
                    <div>
                      <p className={cn('text-sm font-semibold', isToday(date) ? 'text-blue-600' : 'text-gray-900')}>
                        {isToday(date) ? 'Today' : formatDateFns(date, 'EEEE')}
                      </p>
                      <p className="text-xs text-gray-400">{formatDateFns(date, 'MMMM d, yyyy')} · {interviews.length} interview{interviews.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>

                  {/* Interview cards */}
                  <div className="space-y-2 ml-[52px]">
                    {interviews.map(interview => (
                      <InterviewCard key={interview._id} interview={interview} onClick={handleEventClick} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <InterviewDetailsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} interview={selectedInterview} onStatusChange={handleStatusChange} />
    </div>
  );
};

export default InterviewEvaluation;
