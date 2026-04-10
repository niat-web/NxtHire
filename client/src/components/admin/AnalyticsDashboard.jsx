// client/src/components/admin/AnalyticsDashboard.jsx
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, BarChart3, Inbox, Loader2 } from 'lucide-react';
import DatePicker from 'react-datepicker';
import StatusBadge from '../common/StatusBadge';
import 'react-datepicker/dist/react-datepicker.css';
import { useDashboardAnalytics, useLatestInterviewDate } from '@/hooks/useAdminQueries';
import { format as formatDateFns, startOfWeek } from 'date-fns';
import { cn } from '@/lib/utils';

const STATUS_COLORS = {
  Scheduled:  { color: '#6366f1', bg: 'bg-indigo-50',  text: 'text-indigo-600' },
  Completed:  { color: '#10B981', bg: 'bg-emerald-50', text: 'text-emerald-600' },
  InProgress: { color: '#F59E0B', bg: 'bg-amber-50',   text: 'text-amber-600' },
  Cancelled:  { color: '#EF4444', bg: 'bg-red-50',     text: 'text-red-600' },
  Pending:    { color: '#94A3B8', bg: 'bg-gray-50',    text: 'text-gray-500' },
};

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const items = payload.filter(p => p.value > 0);
  if (!items.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 text-xs min-w-[120px]">
      <p className="font-semibold text-gray-900 mb-2">{label}</p>
      {items.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-4 py-0.5">
          <span className="flex items-center gap-1.5 text-gray-500">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.fill }} />
            {p.name}
          </span>
          <span className="font-bold text-gray-900">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

const DateInput = React.forwardRef(({ value, onClick, view }, ref) => {
  let label = 'Select Date';
  if (value) {
    if (view === 'weekly') label = `Week of ${formatDateFns(startOfWeek(new Date(value), { weekStartsOn: 1 }), 'MMM d')}`;
    else if (view === 'monthly') label = formatDateFns(new Date(value), 'MMM yyyy');
    else label = formatDateFns(new Date(value), 'MMM d, yyyy');
  }
  return (
    <button onClick={onClick} ref={ref}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors">
      <Calendar size={13} className="text-gray-400" />
      {label}
    </button>
  );
});

const AnalyticsDashboard = () => {
  const [view, setView] = useState('weekly');
  const [targetDate, setTargetDate] = useState(null);
  const [hiddenSeries, setHiddenSeries] = useState([]);

  const { data: latestDateData } = useLatestInterviewDate({ staleTime: 10 * 60 * 1000 });
  const effectiveDate = targetDate || (latestDateData?.latestDate ? new Date(latestDateData.latestDate) : null);

  const analyticsParams = effectiveDate ? { view, targetDate: effectiveDate.toISOString() } : null;
  const { data: analyticsResult, isLoading: loading } = useDashboardAnalytics(analyticsParams, {
    enabled: !!effectiveDate,
    staleTime: 2 * 60 * 1000,
  });

  const analyticsData = analyticsResult?.analytics || [];
  const recentInterviews = analyticsResult?.recentInterviews || [];

  const totals = useMemo(() => {
    const init = { Scheduled: 0, Completed: 0, InProgress: 0, Cancelled: 0, Pending: 0 };
    return analyticsData.reduce((acc, d) => {
      Object.keys(init).forEach(k => { acc[k] += d[k] || 0; });
      return acc;
    }, init);
  }, [analyticsData]);

  const chartData = useMemo(() => {
    if (view === 'monthly') return analyticsData.map(d => ({ ...d, name: `W${d.week}` }));
    if (view === 'daily') return analyticsData.map(d => ({ ...d, name: `${d.hour}:00` }));
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const week = days.map(n => ({ name: n, Scheduled: 0, Completed: 0, InProgress: 0, Cancelled: 0, Pending: 0 }));
    analyticsData.forEach(d => {
      const idx = d.day - 1;
      if (idx >= 0 && idx < 7) week[idx] = { ...week[idx], ...d, Pending: d.Pending || 0 };
    });
    return week;
  }, [analyticsData, view]);

  const totalInterviews = Object.values(totals).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
            <BarChart3 size={15} className="text-indigo-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Interview Analytics</h2>
            <p className="text-xs text-gray-400">{totalInterviews} total this {view === 'daily' ? 'day' : view === 'monthly' ? 'month' : 'week'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {['daily', 'weekly', 'monthly'].map(v => (
              <button key={v} onClick={() => setView(v)}
                className={cn(
                  'px-2.5 py-1 text-xs font-medium rounded-md capitalize transition-all',
                  view === v ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                )}>
                {v}
              </button>
            ))}
          </div>
          <DatePicker
            selected={targetDate}
            onChange={d => setTargetDate(d)}
            showWeekNumbers={view === 'weekly'}
            showMonthYearPicker={view === 'monthly'}
            customInput={<DateInput view={view} />}
            withPortal={false}
            popperClassName="!z-[9999]"
            popperProps={{ strategy: 'fixed' }}
            popperPlacement="bottom-end"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[280px]">
          <Loader2 size={22} className="animate-spin text-indigo-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Chart + Legend */}
          <div className="lg:col-span-2 space-y-3">
            {/* Inline stat legend — clickable to toggle series */}
            <div className="flex flex-wrap gap-2">
              {Object.entries(STATUS_COLORS).map(([status, c]) => {
                const hidden = hiddenSeries.includes(status);
                return (
                  <button key={status} onClick={() => setHiddenSeries(prev => prev.includes(status) ? prev.filter(k => k !== status) : [...prev, status])}
                    className={cn(
                      'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all',
                      hidden
                        ? 'bg-white border-gray-200 text-gray-400 opacity-50'
                        : `${c.bg} ${c.text} border-transparent`
                    )}>
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: hidden ? '#d1d5db' : c.color }} />
                    {status === 'InProgress' ? 'In Progress' : status}
                    <span className={cn('font-bold ml-0.5', hidden ? 'text-gray-400' : '')}>{totals[status]}</span>
                  </button>
                );
              })}
            </div>

            {/* Chart */}
            <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-100">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} dy={8} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.04)' }} />
                  {Object.entries(STATUS_COLORS).map(([status, c]) => (
                    <Bar key={status} dataKey={status} fill={c.color} barSize={8} radius={[4, 4, 0, 0]}
                      hide={hiddenSeries.includes(status)} animationDuration={600} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Interviews sidebar */}
          <div className="bg-gray-50/80 rounded-xl border border-gray-100 flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Recent Interviews</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5 max-h-[320px]">
              {recentInterviews.length > 0 ? (
                recentInterviews.map(iv => (
                  <div key={iv._id} className="flex items-center justify-between gap-2 p-2.5 bg-white rounded-lg border border-gray-100 hover:shadow-sm transition-shadow">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-900 truncate">{iv.candidateName}</p>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">{iv.interviewId || 'N/A'}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <StatusBadge status={iv.interviewStatus} />
                      <span className="text-[10px] text-gray-400">{formatDateFns(new Date(iv.interviewDate), 'MMM d')}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                  <Inbox size={20} className="mb-2 opacity-40" />
                  <p className="text-xs">No recent interviews</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
