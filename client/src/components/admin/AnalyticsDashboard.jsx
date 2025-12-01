// client/src/components/admin/AnalyticsDashboard.jsx

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, CheckSquare, Clock, X, BarChart2, Inbox, Filter } from 'lucide-react';
import DatePicker from 'react-datepicker';
import StatusBadge from '../common/StatusBadge';
import "react-datepicker/dist/react-datepicker.css";
import { getDashboardAnalytics, getLatestInterviewDate } from '@/api/admin.api';
import { format as formatDateFns, startOfWeek } from 'date-fns';

const STATUS_COLORS = {
    Scheduled: '#3B82F6', // Blue
    Completed: '#10B981', // Green
    InProgress: '#F59E0B', // Amber
    Cancelled: '#EF4444', // Red
    Pending: '#64748B'   // Slate-500
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl shadow-xl p-4 text-sm z-50">
                <p className="font-bold text-slate-800 mb-2">{label}</p>
                {payload.map((p, i) => (
                    p.value > 0 && (
                        <div key={i} className="flex items-center mb-1 last:mb-0">
                            <div className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: p.fill }}></div>
                            <span className="text-slate-600 capitalize">{p.name}: </span>
                            <span className="font-bold ml-1 text-slate-800">{p.value}</span>
                        </div>
                    )
                ))}
            </div>
        );
    }
    return null;
};

const StatusCard = ({ title, value, icon: Icon, color }) => (
    <div className="relative bg-slate-50 border border-slate-100 rounded-xl p-4 overflow-hidden hover:bg-white hover:shadow-md transition-all duration-200 group">
        <div className="flex justify-between items-center relative z-10">
            <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</p>
                <p className="text-2xl font-black mt-1" style={{ color }}>{value}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-white shadow-sm group-hover:scale-110 transition-transform duration-200">
                <Icon className="h-5 w-5" style={{ color }} />
            </div>
        </div>
        {/* Decorative background element */}
        <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full opacity-10 transition-transform duration-300 group-hover:scale-150" style={{ backgroundColor: color }}></div>
    </div>
);

const CustomDateInput = React.forwardRef(({ value, onClick, view }, ref) => {
    let formattedDate = 'Select Date';
    if (value) {
        if (view === 'weekly') {
            const weekStart = startOfWeek(new Date(value), { weekStartsOn: 1 });
            formattedDate = `Week of ${formatDateFns(weekStart, 'MMM d, yyyy')}`;
        } else if (view === 'monthly') {
            formattedDate = formatDateFns(new Date(value), 'MMMM yyyy');
        } else {
            formattedDate = formatDateFns(new Date(value), 'MMM d, yyyy');
        }
    }
    return (
        <button onClick={onClick} ref={ref} className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-all w-full sm:w-auto">
            <Calendar className="h-4 w-4 text-slate-500" />
            {formattedDate}
        </button>
    );
});


const AnalyticsDashboard = () => {
    const [view, setView] = useState('weekly');
    const [targetDate, setTargetDate] = useState(null);
    const [analyticsData, setAnalyticsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [recentInterviews, setRecentInterviews] = useState([]);
    const [hiddenSeries, setHiddenSeries] = useState([]);

    const fetchData = useCallback(async (dateToFetch) => {
        if (!dateToFetch) return;
        setLoading(true);
        try {
            const response = await getDashboardAnalytics({ view, targetDate: dateToFetch.toISOString() });
            const responseData = response.data.data;
            setAnalyticsData(responseData.analytics || []);
            setRecentInterviews(responseData.recentInterviews || []);
        } catch (error) {
            console.error("Failed to load analytics data:", error);
            setAnalyticsData([]);
        } finally {
            setLoading(false);
        }
    }, [view]);

    useEffect(() => {
        getLatestInterviewDate()
            .then(res => setTargetDate(new Date(res.data.data.latestDate)))
            .catch(() => setTargetDate(new Date()));
    }, []);

    useEffect(() => {
        if (targetDate) fetchData(targetDate);
    }, [view, targetDate, fetchData]);

    const { totals } = useMemo(() => {
        const initialTotals = { Scheduled: 0, Completed: 0, InProgress: 0, Cancelled: 0, Pending: 0 };
        const totals = analyticsData.reduce((acc, day) => {
            acc.Scheduled += day.Scheduled || 0;
            acc.Completed += day.Completed || 0;
            acc.InProgress += day.InProgress || 0;
            acc.Cancelled += day.Cancelled || 0;
            acc.Pending += day.Pending || 0;
            return acc;
        }, initialTotals);

        return { totals };
    }, [analyticsData]);

    const chartData = useMemo(() => {
        if (view !== 'weekly') {
            if (view === 'monthly') return analyticsData.map(d => ({ ...d, name: `W${d.week}` }));
            if (view === 'daily') return analyticsData.map(d => ({ ...d, name: `${d.hour}:00` }));
            return analyticsData;
        }

        const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const weekData = daysOfWeek.map(dayName => ({ name: dayName, Scheduled: 0, Completed: 0, InProgress: 0, Cancelled: 0, Pending: 0 }));

        analyticsData.forEach(apiDay => {
            const dayIndex = apiDay.day - 1;
            if (dayIndex >= 0 && dayIndex < 7) {
                weekData[dayIndex] = { ...weekData[dayIndex], ...apiDay, Pending: apiDay.Pending || 0 };
            }
        });
        return weekData;
    }, [analyticsData, view]);

    const handleLegendClick = (dataKey) => {
        setHiddenSeries(prev =>
            prev.includes(dataKey)
                ? prev.filter(key => key !== dataKey)
                : [...prev, dataKey]
        );
    };


    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-50 rounded-lg">
                        <BarChart2 className="h-5 w-5 text-blue-600" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-800">Interview Analytics</h2>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200">
                        {['daily', 'weekly', 'monthly'].map((v) => (
                            <button
                                key={v}
                                onClick={() => setView(v)}
                                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all capitalize ${view === v ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                            >
                                {v}
                            </button>
                        ))}
                    </div>
                    <div className="relative z-20">
                        <DatePicker
                            selected={targetDate}
                            onChange={date => setTargetDate(date)}
                            showWeekNumbers={view === 'weekly'}
                            showMonthYearPicker={view === 'monthly'}
                            customInput={<CustomDateInput view={view} />}
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <StatusCard title="Scheduled" value={totals.Scheduled} icon={Calendar} color={STATUS_COLORS.Scheduled} />
                <StatusCard title="Completed" value={totals.Completed} icon={CheckSquare} color={STATUS_COLORS.Completed} />
                <StatusCard title="In Progress" value={totals.InProgress} icon={Clock} color={STATUS_COLORS.InProgress} />
                <StatusCard title="Cancelled" value={totals.Cancelled} icon={X} color={STATUS_COLORS.Cancelled} />
                <StatusCard title="Pending" value={totals.Pending} icon={Clock} color={STATUS_COLORS.Pending} />
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center min-h-[300px]">
                    <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                    <div className="lg:col-span-2 bg-slate-50/50 p-5 rounded-xl border border-slate-100 flex flex-col">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <BarChart2 size={16} className="text-slate-400" />
                            Interview Trends
                        </h3>
                        <div className="flex-1 min-h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={4}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} dy={10} />
                                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
                                    <Legend
                                        wrapperStyle={{ fontSize: "12px", paddingTop: '20px', cursor: 'pointer' }}
                                        onClick={(e) => handleLegendClick(e.dataKey)}
                                        iconType="circle"
                                    />

                                    {Object.entries(STATUS_COLORS).map(([status, color]) => (
                                        <Bar
                                            key={status}
                                            dataKey={status}
                                            fill={color}
                                            barSize={12}
                                            radius={[4, 4, 0, 0]}
                                            hide={hiddenSeries.includes(status)}
                                            animationDuration={1000}
                                        />
                                    ))}
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-slate-50/50 p-5 rounded-xl border border-slate-100 flex flex-col">

                        <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar min-h-[300px] max-h-[400px]">
                            {recentInterviews.length > 0 ? (
                                recentInterviews.map((interview) => (
                                    <div key={interview._id} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between gap-3 group">
                                        <div className="min-w-0">
                                            <p className="font-bold text-slate-800 text-sm truncate group-hover:text-blue-600 transition-colors" title={interview.candidateName}>{interview.candidateName}</p>
                                            <p className="text-xs text-slate-500 font-mono mt-0.5" title={interview.interviewId}>{interview.interviewId || 'ID: N/A'}</p>
                                        </div>

                                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                            <StatusBadge status={interview.interviewStatus} size="sm" />
                                            <p className="text-[10px] text-slate-400 font-medium">{formatDateFns(new Date(interview.interviewDate), 'MMM d')}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                                        <Inbox className="h-6 w-6 opacity-50" />
                                    </div>
                                    <p className="text-sm font-medium">No recent interviews</p>
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
