// client/src/components/admin/AnalyticsDashboard.jsx
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, CheckSquare, Clock, X, BarChart3, Inbox, Loader2 } from 'lucide-react';
import DatePicker from 'react-datepicker';
import StatusBadge from '../common/StatusBadge';
import 'react-datepicker/dist/react-datepicker.css';
import { useDashboardAnalytics, useLatestInterviewDate } from '@/hooks/useAdminQueries';
import { format as formatDateFns, startOfWeek } from 'date-fns';

const STATUS_COLORS = {
  Scheduled: '#3B82F6',
  Completed: '#10B981',
  InProgress: '#F59E0B',
  Cancelled: '#EF4444',
  Pending: '#94A3B8',
};

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-800 mb-1.5">{label}</p>
      {payload.map((p, i) =>
        p.value > 0 ? (
          <div key={i} className="flex items-center gap-2 text-gray-600">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.fill }} />
            <span className="capitalize">{p.name}:</span>
            <span className="font-semibold text-gray-900">{p.value}</span>
          </div>
        ) : null
      )}
    </div>
  );
};

const MiniStat = ({ label, value, color }) => (
  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50">
    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
    <span className="text-xs text-gray-500">{label}</span>
    <span className="text-sm font-bold text-gray-900 ml-auto">{value}</span>
  </div>
);

const DateInput = React.forwardRef(({ value, onClick, view }, ref) => {
  let label = 'Select Date';
  if (value) {
    if (view === 'weekly') {
      label = `Week of ${formatDateFns(startOfWeek(new Date(value), { weekStartsOn: 1 }), 'MMM d, yyyy')}`;
    } else if (view === 'monthly') {
      label = formatDateFns(new Date(value), 'MMMM yyyy');
    } else {
      label = formatDateFns(new Date(value), 'MMM d, yyyy');
    }
  }
  return (
    <button
      onClick={onClick}
      ref={ref}
      className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
    >
      <Calendar size={14} className="text-gray-400" />
      {label}
    </button>
  );
});

const AnalyticsDashboard = () => {
  const [view, setView] = useState('weekly');
  const [targetDate, setTargetDate] = useState(null);
  const [hiddenSeries, setHiddenSeries] = useState([]);

  const { data: latestDateData } = useLatestInterviewDate({
    staleTime: 10 * 60 * 1000,
  });

  // Set targetDate from latest interview date (only once when data arrives)
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

  const handleLegendClick = (dataKey) => {
    setHiddenSeries(prev =>
      prev.includes(dataKey) ? prev.filter(k => k !== dataKey) : [...prev, dataKey]
    );
  };

  return (
    <div className="space-y-5">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BarChart3 size={18} className="text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-900">Interview Analytics</h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View toggle */}
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {['daily', 'weekly', 'monthly'].map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1 text-xs font-medium rounded-md capitalize transition-colors ${
                  view === v
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          <div className="relative z-20">
            <DatePicker
              selected={targetDate}
              onChange={d => setTargetDate(d)}
              showWeekNumbers={view === 'weekly'}
              showMonthYearPicker={view === 'monthly'}
              customInput={<DateInput view={view} />}
            />
          </div>
        </div>
      </div>

      {/* Mini stat pills */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <MiniStat label="Scheduled" value={totals.Scheduled} color={STATUS_COLORS.Scheduled} />
        <MiniStat label="Completed" value={totals.Completed} color={STATUS_COLORS.Completed} />
        <MiniStat label="In Progress" value={totals.InProgress} color={STATUS_COLORS.InProgress} />
        <MiniStat label="Cancelled" value={totals.Cancelled} color={STATUS_COLORS.Cancelled} />
        <MiniStat label="Pending" value={totals.Pending} color={STATUS_COLORS.Pending} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[260px]">
          <Loader2 size={22} className="animate-spin text-gray-300" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Chart */}
          <div className="lg:col-span-2 bg-gray-50 rounded-xl p-4 border border-gray-100 min-h-[280px]">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barGap={3}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} dy={8} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '16px', cursor: 'pointer' }}
                  onClick={e => handleLegendClick(e.dataKey)}
                  iconType="circle"
                  iconSize={8}
                />
                {Object.entries(STATUS_COLORS).map(([status, color]) => (
                  <Bar
                    key={status}
                    dataKey={status}
                    fill={color}
                    barSize={10}
                    radius={[3, 3, 0, 0]}
                    hide={hiddenSeries.includes(status)}
                    animationDuration={800}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recent interviews sidebar */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Recent Interviews
            </h3>
            <div className="flex-1 overflow-y-auto space-y-2 max-h-[300px]">
              {recentInterviews.length > 0 ? (
                recentInterviews.map(iv => (
                  <div
                    key={iv._id}
                    className="flex items-center justify-between gap-2 p-2.5 bg-white rounded-lg border border-gray-100 hover:shadow-sm transition-shadow"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{iv.candidateName}</p>
                      <p className="text-[11px] text-gray-400 font-mono">{iv.interviewId || 'N/A'}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <StatusBadge status={iv.interviewStatus} />
                      <span className="text-[10px] text-gray-400">
                        {formatDateFns(new Date(iv.interviewDate), 'MMM d')}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                  <Inbox size={24} className="mb-2 opacity-40" />
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
