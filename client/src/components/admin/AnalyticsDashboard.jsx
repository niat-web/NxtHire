// import React, { useState, useEffect, useMemo, useCallback } from 'react';
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Label } from 'recharts';
// import { FiCalendar, FiCheckSquare, FiClock, FiX, FiInfo, FiBarChart2 } from 'react-icons/fi';
// import DatePicker from 'react-datepicker';
// import "react-datepicker/dist/react-datepicker.css";
// import { getDashboardAnalytics, getLatestInterviewDate } from '@/api/admin.api';
// import { format as formatDateFns, startOfWeek } from 'date-fns';

// const STATUS_COLORS = {
//   Scheduled: '#3B82F6', // Blue
//   Completed: '#10B981', // Green
//   InProgress: '#F59E0B', // Amber
//   Cancelled: '#EF4444', // Red
//   Pending: '#6B7280'   // Gray
// };

// // --- MODIFICATION: Improved Tooltip for Grouped Bars ---
// const CustomTooltip = ({ active, payload, label }) => {
//     if (active && payload && payload.length) {
//       return (
//         <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-xl p-3 text-sm">
//           <p className="font-bold text-gray-800 mb-2">{label}</p>
//           {payload.map((p, i) => (
//             p.value > 0 && (
//                 <div key={i} className="flex items-center">
//                 <div className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: p.fill }}></div>
//                 <span className="text-gray-700 capitalize">{p.name}: </span>
//                 <span className="font-semibold ml-1">{p.value}</span>
//                 </div>
//             )
//           ))}
//         </div>
//       );
//     }
//     return null;
// };

// const StatusCard = ({ title, value, icon: Icon, color }) => (
//     <div className="relative bg-white border border-gray-200 rounded-xl shadow-sm p-4 overflow-hidden">
//         <div className="flex justify-between items-center">
//             <div>
//                 <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
//                 <p className="text-3xl font-bold mt-1" style={{ color }}>{value}</p>
//             </div>
//             <div className="p-3 rounded-full" style={{ backgroundColor: `${color}20` }}>
//                 <Icon className="h-5 w-5" style={{ color }} />
//             </div>
//         </div>
//         <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full" style={{ backgroundColor: `${color}10` }}></div>
//     </div>
// );

// const CustomDateInput = React.forwardRef(({ value, onClick, view }, ref) => {
//     let formattedDate = 'Select Date';
//     if (value) {
//         if (view === 'weekly') {
//             const weekStart = startOfWeek(new Date(value), { weekStartsOn: 1 });
//             formattedDate = `Week of ${formatDateFns(weekStart, 'MMM d, yyyy')}`;
//         } else if (view === 'monthly') {
//             formattedDate = formatDateFns(new Date(value), 'MMMM yyyy');
//         } else {
//             formattedDate = formatDateFns(new Date(value), 'MMM d, yyyy');
//         }
//     }
//     return (
//         <button onClick={onClick} ref={ref} className="form-input py-1.5 pl-9 pr-3 text-sm border rounded-lg text-left w-full sm:w-auto">
//             <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
//             {formattedDate}
//         </button>
//     );
// });


// const AnalyticsDashboard = () => {
//     const [view, setView] = useState('weekly');
//     const [targetDate, setTargetDate] = useState(null);
//     const [analyticsData, setAnalyticsData] = useState([]);
//     const [loading, setLoading] = useState(true);
//     // --- NEW: State for interactive legend ---
//     const [hiddenSeries, setHiddenSeries] = useState([]);

//     const fetchData = useCallback(async (dateToFetch) => {
//         if (!dateToFetch) return;
//         setLoading(true);
//         try {
//             const response = await getDashboardAnalytics({ view, targetDate: dateToFetch.toISOString() });
//             setAnalyticsData(response.data.data || []);
//         } catch (error) {
//             console.error("Failed to load analytics data:", error);
//             setAnalyticsData([]);
//         } finally {
//             setLoading(false);
//         }
//     }, [view]);
    
//     useEffect(() => {
//         getLatestInterviewDate()
//             .then(res => setTargetDate(new Date(res.data.data.latestDate)))
//             .catch(() => setTargetDate(new Date()));
//     }, []);
    
//     useEffect(() => {
//         if(targetDate) fetchData(targetDate);
//     }, [view, targetDate, fetchData]);
    
//     const { totals, pieData } = useMemo(() => {
//         const initialTotals = { Scheduled: 0, Completed: 0, InProgress: 0, Cancelled: 0, Pending: 0 };
//         const totals = analyticsData.reduce((acc, day) => {
//             acc.Scheduled += day.Scheduled || 0;
//             acc.Completed += day.Completed || 0;
//             acc.InProgress += day.InProgress || 0;
//             acc.Cancelled += day.Cancelled || 0;
//             acc.Pending += day.Pending || 0;
//             return acc;
//         }, initialTotals);

//         const pieData = Object.keys(totals).map(key => ({
//             name: key, value: totals[key]
//         })).filter(item => item.value > 0);
//         return { totals, pieData };
//     }, [analyticsData]);
    
//     const chartData = useMemo(() => {
//         if (view !== 'weekly') {
//             if (view === 'monthly') return analyticsData.map(d => ({...d, name: `W${d.week}`}));
//             if (view === 'daily') return analyticsData.map(d => ({...d, name: `${d.hour}:00` }));
//             return analyticsData;
//         }

//         const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
//         const weekData = daysOfWeek.map(dayName => ({ name: dayName, Scheduled: 0, Completed: 0, InProgress: 0, Cancelled: 0, Pending: 0 }));

//         analyticsData.forEach(apiDay => {
//             const dayIndex = apiDay.day - 1;
//             if (dayIndex >= 0 && dayIndex < 7) {
//                 weekData[dayIndex] = { ...weekData[dayIndex], ...apiDay, Pending: apiDay.Pending || 0 };
//             }
//         });
//         return weekData;
//     }, [analyticsData, view]);
    
//     // --- NEW: Handler for interactive legend ---
//     const handleLegendClick = (dataKey) => {
//         setHiddenSeries(prev => 
//             prev.includes(dataKey) 
//                 ? prev.filter(key => key !== dataKey) 
//                 : [...prev, dataKey]
//         );
//     };
    
//     const totalInterviews = useMemo(() => Object.values(totals).reduce((a, b) => a + b, 0), [totals]);

//     return (
//         <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 space-y-4">
//             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//                 <div className="flex items-center"><FiBarChart2 className="h-5 w-5 text-blue-600 mr-2" /><h2 className="text-lg font-bold text-gray-800">Interview Analytics</h2></div>
//                 <div className="flex flex-wrap items-center gap-2">
//                     <div className="flex bg-gray-100 rounded-lg p-1"><button onClick={() => setView('daily')} className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${view === 'daily' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-700 hover:bg-gray-200'}`}>Daily</button><button onClick={() => setView('weekly')} className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${view === 'weekly' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-700 hover:bg-gray-200'}`}>Weekly</button><button onClick={() => setView('monthly')} className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${view === 'monthly' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-700 hover:bg-gray-200'}`}>Monthly</button></div>
//                     <div className="relative"><DatePicker selected={targetDate} onChange={date => setTargetDate(date)} showWeekNumbers={view === 'weekly'} showMonthYearPicker={view === 'monthly'} customInput={<CustomDateInput view={view}/>} /></div>
//                 </div>
//             </div>
//             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
//                 <StatusCard title="Scheduled" value={totals.Scheduled} icon={FiCalendar} color={STATUS_COLORS.Scheduled} />
//                 <StatusCard title="Completed" value={totals.Completed} icon={FiCheckSquare} color={STATUS_COLORS.Completed} />
//                 <StatusCard title="In Progress" value={totals.InProgress} icon={FiClock} color={STATUS_COLORS.InProgress} />
//                 <StatusCard title="Cancelled" value={totals.Cancelled} icon={FiX} color={STATUS_COLORS.Cancelled} />
//                 <StatusCard title="Pending" value={totals.Pending} icon={FiClock} color={STATUS_COLORS.Pending} />
//             </div>

//             {loading ? <div className="h-80 flex items-center justify-center"><div className="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div></div> : (
//                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//                     <div className="lg:col-span-2 bg-gray-50/50 p-4 rounded-lg border border-gray-100">
//                          <h3 className="font-bold text-gray-800 mb-2">Interview Trends</h3>
//                         <div className="h-80">
//                             <ResponsiveContainer width="100%" height="100%">
//                                 <BarChart data={chartData} margin={{ top: 5, right: 20, left: -15, bottom: 5 }} barGap={4}>
//                                     <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
//                                     <XAxis dataKey="name" tick={{ fontSize: 12 }} />
//                                     <YAxis tick={{ fontSize: 12 }} allowDecimals={false} width={30}/>
//                                     <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(239, 246, 255, 0.7)' }}/>
//                                     <Legend wrapperStyle={{fontSize: "12px", paddingTop: '15px', cursor: 'pointer'}} onClick={(e) => handleLegendClick(e.dataKey)}/>
                                    
//                                     {Object.entries(STATUS_COLORS).map(([status, color]) => (
//                                         <Bar key={status} dataKey={status} fill={color} barSize={15} radius={[4, 4, 0, 0]} hide={hiddenSeries.includes(status)} />
//                                     ))}
//                                 </BarChart>
//                             </ResponsiveContainer>
//                         </div>
//                     </div>
//                     <div className="bg-gray-50/50 p-4 rounded-lg border border-gray-100">
//                          <h3 className="font-bold text-gray-800 mb-2">Interview Summary</h3>
//                         <div className="h-80 flex flex-col justify-center items-center">
//                             {pieData.length > 0 ? (
//                                 <ResponsiveContainer width="100%" height="100%">
//                                     <PieChart>
//                                         <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={3} dataKey="value" nameKey="name">
//                                             {pieData.map((entry) => (<Cell key={`cell-${entry.name}`} fill={STATUS_COLORS[entry.name]} stroke={STATUS_COLORS[entry.name]}/>))}
//                                             <Label value={totalInterviews} position="center" className="text-4xl font-bold fill-gray-800" />
//                                             <Label value="Total Interviews" position="center" dy={25} className="text-sm fill-gray-500"/>
//                                         </Pie>
//                                         <Tooltip content={<CustomTooltip/>}/>
//                                         <Legend wrapperStyle={{fontSize: "12px"}}/>
//                                     </PieChart>
//                                 </ResponsiveContainer>
//                             ) : ( <div className="text-center text-gray-500">No data available for this period</div> )}
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default AnalyticsDashboard;


import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FiCalendar, FiCheckSquare, FiClock, FiX, FiInfo, FiBarChart2, FiInbox } from 'react-icons/fi';
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
  Pending: '#6B7280'   // Gray
};

// --- MODIFICATION: Improved Tooltip for Grouped Bars ---
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-xl p-3 text-sm">
          <p className="font-bold text-gray-800 mb-2">{label}</p>
          {payload.map((p, i) => (
            p.value > 0 && (
                <div key={i} className="flex items-center">
                <div className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: p.fill }}></div>
                <span className="text-gray-700 capitalize">{p.name}: </span>
                <span className="font-semibold ml-1">{p.value}</span>
                </div>
            )
          ))}
        </div>
      );
    }
    return null;
};

const StatusCard = ({ title, value, icon: Icon, color }) => (
    <div className="relative bg-white border border-gray-200 rounded-xl shadow-sm p-4 overflow-hidden">
        <div className="flex justify-between items-center">
            <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
                <p className="text-3xl font-bold mt-1" style={{ color }}>{value}</p>
            </div>
            <div className="p-3 rounded-full" style={{ backgroundColor: `${color}20` }}>
                <Icon className="h-5 w-5" style={{ color }} />
            </div>
        </div>
        <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full" style={{ backgroundColor: `${color}10` }}></div>
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
        <button onClick={onClick} ref={ref} className="form-input py-1.5 pl-9 pr-3 text-sm border rounded-lg text-left w-full sm:w-auto">
            <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            {formattedDate}
        </button>
    );
});


const AnalyticsDashboard = () => {
    const [view, setView] = useState('weekly');
    const [targetDate, setTargetDate] = useState(null);
    const [analyticsData, setAnalyticsData] = useState([]);
    const [loading, setLoading] = useState(true);
    // --- NEW: State for recent interviews table ---
    const [recentInterviews, setRecentInterviews] = useState([]);
    // --- NEW: State for interactive legend ---
    const [hiddenSeries, setHiddenSeries] = useState([]);

    const fetchData = useCallback(async (dateToFetch) => {
        if (!dateToFetch) return;
        setLoading(true);
        try {
            const response = await getDashboardAnalytics({ view, targetDate: dateToFetch.toISOString() });
            // --- MODIFICATION: Handle new API response structure ---
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
        if(targetDate) fetchData(targetDate);
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
            if (view === 'monthly') return analyticsData.map(d => ({...d, name: `W${d.week}`}));
            if (view === 'daily') return analyticsData.map(d => ({...d, name: `${d.hour}:00` }));
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
    
    // --- NEW: Handler for interactive legend ---
    const handleLegendClick = (dataKey) => {
        setHiddenSeries(prev => 
            prev.includes(dataKey) 
                ? prev.filter(key => key !== dataKey) 
                : [...prev, dataKey]
        );
    };
    

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center"><FiBarChart2 className="h-5 w-5 text-blue-600 mr-2" /><h2 className="text-lg font-bold text-gray-800">Interview Analytics</h2></div>
                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex bg-gray-100 rounded-lg p-1"><button onClick={() => setView('daily')} className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${view === 'daily' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-700 hover:bg-gray-200'}`}>Daily</button><button onClick={() => setView('weekly')} className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${view === 'weekly' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-700 hover:bg-gray-200'}`}>Weekly</button><button onClick={() => setView('monthly')} className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${view === 'monthly' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-700 hover:bg-gray-200'}`}>Monthly</button></div>
                    <div className="relative"><DatePicker selected={targetDate} onChange={date => setTargetDate(date)} showWeekNumbers={view === 'weekly'} showMonthYearPicker={view === 'monthly'} customInput={<CustomDateInput view={view}/>} /></div>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <StatusCard title="Scheduled" value={totals.Scheduled} icon={FiCalendar} color={STATUS_COLORS.Scheduled} />
                <StatusCard title="Completed" value={totals.Completed} icon={FiCheckSquare} color={STATUS_COLORS.Completed} />
                <StatusCard title="In Progress" value={totals.InProgress} icon={FiClock} color={STATUS_COLORS.InProgress} />
                <StatusCard title="Cancelled" value={totals.Cancelled} icon={FiX} color={STATUS_COLORS.Cancelled} />
                <StatusCard title="Pending" value={totals.Pending} icon={FiClock} color={STATUS_COLORS.Pending} />
            </div>

            {loading ? <div className="h-80 flex items-center justify-center"><div className="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div></div> : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-gray-50/50 p-4 rounded-lg border border-gray-100">
                         <h3 className="font-bold text-gray-800 mb-2">Interview Trends</h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 5, right: 20, left: -15, bottom: 5 }} barGap={4}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} allowDecimals={false} width={30}/>
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(239, 246, 255, 0.7)' }}/>
                                    <Legend wrapperStyle={{fontSize: "12px", paddingTop: '15px', cursor: 'pointer'}} onClick={(e) => handleLegendClick(e.dataKey)}/>
                                    
                                    {Object.entries(STATUS_COLORS).map(([status, color]) => (
                                        <Bar key={status} dataKey={status} fill={color} barSize={15} radius={[4, 4, 0, 0]} hide={hiddenSeries.includes(status)} />
                                    ))}
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    {/* --- MODIFICATION START: Replaced Pie Chart with Recent Activity Table --- */}
                    <div className="bg-gray-50/50 p-4 rounded-lg border border-gray-100">
                         <h3 className="font-bold text-gray-800 mb-4">Recent Activity</h3>
                        <div className="h-80 overflow-y-auto pr-2 space-y-2">
                           {recentInterviews.length > 0 ? (
                                recentInterviews.map((interview) => (
                                    <div key={interview._id} className="bg-white p-3 rounded-lg border border-gray-200 flex items-center justify-between gap-3 text-sm">
                                        {/* Left Side: Name and ID */}
                                        <div className="flex items-baseline gap-2 min-w-0">
                                            <p className="font-semibold text-gray-800 truncate" title={interview.candidateName}>{interview.candidateName}</p>
                                            <p className="text-xs text-gray-500 font-mono flex-shrink-0" title={interview.interviewId}>{interview.interviewId || 'N/A'}</p>
                                        </div>

                                        {/* Right Side: Date and Status */}
                                        <div className="flex items-center gap-3 flex-shrink-0">
                                            <p className="text-xs text-gray-600 whitespace-nowrap">{formatDateFns(new Date(interview.interviewDate), 'MMM d, yyyy')}</p>
                                            <StatusBadge status={interview.interviewStatus} />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                    <FiInbox className="h-8 w-8 mb-2" />
                                    <p className="text-sm">No recent interviews.</p>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* --- MODIFICATION END --- */}
                </div>
            )}
        </div>
    );
};

export default AnalyticsDashboard;
