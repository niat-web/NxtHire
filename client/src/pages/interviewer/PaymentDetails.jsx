// // client/src/pages/interviewer/PaymentDetails.jsx
// import React, { useState, useEffect, useMemo, useCallback } from 'react';
// import { getPaymentHistory } from '@/api/interviewer.api';
// import { useAlert } from '@/hooks/useAlert';
// import { startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear } from 'date-fns';
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';

// // Local components to avoid external dependencies on this page
// const LocalLoader = () => (<div className="flex justify-center items-center py-20 text-center text-gray-500"><div className="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div><span className="ml-4">Loading Payments...</span></div>);
// const LocalStatCard = ({ title, value, isLoading }) => (
//     <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
//         <p className="text-sm font-medium text-gray-500">{title}</p>
//         {isLoading ? (
//             <div className="h-8 w-24 bg-gray-200 animate-pulse rounded mt-1"></div>
//         ) : (
//             <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
//         )}
//     </div>
// );

// const PaymentDetails = () => {
//     const { showError } = useAlert();
//     const [loading, setLoading] = useState(true);
//     const [paymentData, setPaymentData] = useState({ breakdown: [], totalAmount: 0, totalInterviews: 0 });
    
//     // Date range state
//     const [activeFilter, setActiveFilter] = useState('This Month');
//     const [dateRange, setDateRange] = useState({
//         startDate: startOfMonth(new Date()),
//         endDate: endOfMonth(new Date())
//     });

//     const filterOptions = [
//         "This Month",
//         "Last Month",
//         "Last 6 Months",
//         "This Year"
//     ];

//     const handleFilterClick = (filter) => {
//         setActiveFilter(filter);
//         const now = new Date();
//         let startDate, endDate;

//         switch (filter) {
//             case "This Month":
//                 startDate = startOfMonth(now);
//                 endDate = endOfMonth(now);
//                 break;
//             case "Last Month":
//                 startDate = startOfMonth(subMonths(now, 1));
//                 endDate = endOfMonth(subMonths(now, 1));
//                 break;
//             case "Last 6 Months":
//                 startDate = startOfMonth(subMonths(now, 5)); // includes current month
//                 endDate = endOfMonth(now);
//                 break;
//             case "This Year":
//                 startDate = startOfYear(now);
//                 endDate = endOfYear(now);
//                 break;
//             default:
//                 startDate = startOfMonth(now);
//                 endDate = endOfMonth(now);
//         }
//         setDateRange({ startDate, endDate });
//     };

//     const handleDateChange = (dates) => {
//         const [start, end] = dates;
//         setDateRange({ startDate: start, endDate: end });
//         setActiveFilter("Custom"); // Deselect predefined filters
//     };

//     const fetchHistory = useCallback(async (start, end) => {
//         setLoading(true);
//         try {
//             const response = await getPaymentHistory({ startDate: start, endDate: end });
//             // --- FIX START ---
//             // The API response is nested under a `data` property.
//             setPaymentData(response.data.data);
//             // --- FIX END ---
//         } catch (err) {
//             showError('Failed to fetch payment history.');
//             setPaymentData({ breakdown: [], totalAmount: 0, totalInterviews: 0 });
//         } finally {
//             setLoading(false);
//         }
//     }, [showError]);

//     useEffect(() => {
//         if (dateRange.startDate && dateRange.endDate) {
//             fetchHistory(dateRange.startDate.toISOString(), dateRange.endDate.toISOString());
//         }
//     }, [dateRange, fetchHistory]);

//     const columns = useMemo(() => [
//         { key: 'domain', title: 'Domain' },
//         { key: 'interviewsCompleted', title: 'Interviews Completed' },
//         { key: 'amount', title: 'Amount', render: (row) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(row.amount) }
//     ], []);

//     return (
//         <div className="space-y-6">
//             {/* Header and Filters */}
//             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//                 <div>
//                     <h1 className="text-2xl font-bold text-gray-800">Payment Details</h1>
//                 </div>
//                 <div className="flex flex-wrap items-center gap-2">
//                     {filterOptions.map(filter => (
//                         <button
//                             key={filter}
//                             onClick={() => handleFilterClick(filter)}
//                             className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
//                                 activeFilter === filter ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
//                             }`}
//                         >
//                             {filter}
//                         </button>
//                     ))}
//                      <DatePicker
//                         selectsRange={true}
//                         startDate={dateRange.startDate}
//                         endDate={dateRange.endDate}
//                         onChange={handleDateChange}
//                         dateFormat="MMM d, yyyy"
//                         className="w-full md:w-60 px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 focus:ring-1 focus:ring-blue-500"
//                         placeholderText="Select custom date range"
//                     />
//                 </div>
//             </div>

//             {/* Summary Stats */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <LocalStatCard 
//                     title="Total Interviews Completed" 
//                     value={loading ? '...' : paymentData.totalInterviews} 
//                     isLoading={loading}
//                 />
//                 <LocalStatCard 
//                     title="Total Earnings" 
//                     value={loading ? '...' : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(paymentData.totalAmount)}
//                     isLoading={loading}
//                 />
//             </div>

//             {/* Details Table */}
//             <div className="bg-white rounded-lg shadow-sm border border-gray-200">
//                 <div className="p-4 border-b">
//                     <h3 className="text-lg font-semibold text-gray-800">Earnings Breakdown</h3>
//                 </div>
//                  {loading ? (
//                      <LocalLoader />
//                  ) : paymentData.breakdown.length > 0 ? (
//                      <>
//                         <div className="overflow-x-auto">
//                             <table className="min-w-full divide-y divide-gray-200">
//                                 <thead className="bg-gray-50">
//                                     <tr>
//                                         {columns.map(col => (
//                                             <th key={col.key} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                                 {col.title}
//                                             </th>
//                                         ))}
//                                     </tr>
//                                 </thead>
//                                 <tbody className="bg-white divide-y divide-gray-200">
//                                     {paymentData.breakdown.map((row, rowIndex) => (
//                                         <tr key={rowIndex}>
//                                             {columns.map(col => (
//                                                 <td key={col.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
//                                                     {col.render ? col.render(row) : row[col.key]}
//                                                 </td>
//                                             ))}
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         </div>
//                      </>
//                  ) : (
//                     <div className="text-center p-12 text-gray-500">
//                         <p>No completed interviews found for the selected period.</p>
//                     </div>
//                  )}
//             </div>
//         </div>
//     );
// };

// export default PaymentDetails;

// client/src/pages/interviewer/PaymentDetails.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getPaymentHistory } from '@/api/interviewer.api';
import { useAlert } from '@/hooks/useAlert';
import { startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FiClock } from 'react-icons/fi';
import { Calendar } from 'lucide-react';


const PaymentDetails = () => {
    const { showError } = useAlert();
    const [loading, setLoading] = useState(true);
    const [paymentData, setPaymentData] = useState({ breakdown: [], totalAmount: 0, totalInterviews: 0 });
    
    // Date range state
    const [activeFilter, setActiveFilter] = useState('This Month');
    const [dateRange, setDateRange] = useState({
        startDate: startOfMonth(new Date()),
        endDate: endOfMonth(new Date())
    });
    
    const [showCustomPicker, setShowCustomPicker] = useState(false);
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');

    const filterOptions = [
        "This Month",
        "Last Month",
        "Last 6 Months",
        "This Year"
    ];

    const handleFilterClick = (filter) => {
        setActiveFilter(filter);
        setShowCustomPicker(false);
        const now = new Date();
        let startDate, endDate;

        switch (filter) {
            case "This Month":
                startDate = startOfMonth(now);
                endDate = endOfMonth(now);
                break;
            case "Last Month":
                startDate = startOfMonth(subMonths(now, 1));
                endDate = endOfMonth(subMonths(now, 1));
                break;
            case "Last 6 Months":
                startDate = startOfMonth(subMonths(now, 5)); // includes current month
                endDate = endOfMonth(now);
                break;
            case "This Year":
                startDate = startOfYear(now);
                endDate = endOfYear(now);
                break;
            default:
                startDate = startOfMonth(now);
                endDate = endOfMonth(now);
        }
        setDateRange({ startDate, endDate });
    };
    
    const handleCustomDateApply = () => {
        if (customStart && customEnd) {
          setDateRange({
            startDate: new Date(customStart),
            endDate: new Date(customEnd)
          });
          setActiveFilter('Custom');
          setShowCustomPicker(false);
        }
    };


    const fetchHistory = useCallback(async (start, end) => {
        setLoading(true);
        try {
            const response = await getPaymentHistory({ startDate: start, endDate: end });
            // --- FIX START ---
            // The API response is nested under a `data` property.
            setPaymentData(response.data.data);
            // --- FIX END ---
        } catch (err) {
            showError('Failed to fetch payment history.');
            setPaymentData({ breakdown: [], totalAmount: 0, totalInterviews: 0 });
        } finally {
            setLoading(false);
        }
    }, [showError]);

    useEffect(() => {
        if (dateRange.startDate && dateRange.endDate) {
            fetchHistory(dateRange.startDate.toISOString(), dateRange.endDate.toISOString());
        }
    }, [dateRange, fetchHistory]);
    
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          minimumFractionDigits: 0
        }).format(amount);
    };

    const formatDateRange = () => {
        if (!dateRange.startDate || !dateRange.endDate) return '';
        const options = { month: 'short', day: 'numeric', year: 'numeric' };
        return `${dateRange.startDate.toLocaleDateString('en-US', options)} - ${dateRange.endDate.toLocaleDateString('en-US', options)}`;
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">

                {/* Filter Section */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-medium text-gray-900">Select Time Period</h2>
                            <span className="text-sm text-gray-500">{formatDateRange()}</span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {filterOptions.map(filter => (
                                <button
                                key={filter}
                                onClick={() => handleFilterClick(filter)}
                                className={`px-4 py-2 text-sm font-medium rounded border transition-colors ${
                                    activeFilter === filter
                                    ? 'bg-gray-900 text-white border-gray-900'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                }`}
                                >
                                {filter}
                                </button>
                            ))}
                            <button
                                onClick={() => setShowCustomPicker(!showCustomPicker)}
                                className={`px-4 py-2 text-sm font-medium rounded border transition-colors flex items-center gap-2 ${
                                activeFilter === 'Custom'
                                    ? 'bg-gray-900 text-white border-gray-900'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                <Calendar size={16} />
                                Custom Range
                            </button>
                        </div>
                        {showCustomPicker && (
                            <div className="border-t pt-4 mt-2">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Start Date
                                    </label>
                                    <input
                                    type="date"
                                    value={customStart}
                                    onChange={(e) => setCustomStart(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                    End Date
                                    </label>
                                    <input
                                    type="date"
                                    value={customEnd}
                                    onChange={(e) => setCustomEnd(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <button
                                    onClick={handleCustomDateApply}
                                    disabled={!customStart || !customEnd}
                                    className="w-full px-4 py-2 bg-gray-900 text-white rounded font-medium hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                    >
                                    Apply
                                    </button>
                                </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-600 mb-2">
                                Total Interviews Completed
                            </span>
                            {loading ? (
                                <div className="h-10 w-24 bg-gray-200 animate-pulse rounded"></div>
                            ) : (
                                <span className="text-4xl font-semibold text-gray-900">
                                {paymentData.totalInterviews}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-600 mb-2">
                                Total Earnings
                            </span>
                            {loading ? (
                                <div className="h-10 w-32 bg-gray-200 animate-pulse rounded"></div>
                            ) : (
                                <span className="text-4xl font-semibold text-gray-900">
                                {formatCurrency(paymentData.totalAmount)}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Breakdown Table */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Earnings Breakdown</h2>
                    </div>
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mb-4"></div>
                            <p className="text-gray-500">Loading payment details...</p>
                        </div>
                    ) : paymentData.breakdown.length > 0 ? (
                        <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Domain</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Interviews Completed</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {paymentData.breakdown.map((row, index) => (
                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-sm text-gray-900">{row.domain}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700">{row.interviewsCompleted}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatCurrency(row.amount)}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <FiClock className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                            <p className="text-gray-500">No completed interviews found for the selected period.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentDetails;
