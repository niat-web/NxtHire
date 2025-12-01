// client/src/pages/interviewer/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMetrics } from '../../api/interviewer.api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { FiCheckCircle, FiDollarSign, FiCalendar, FiXCircle, FiClock, FiGrid, FiArrowRight } from 'react-icons/fi';

// Status Badge Component
const StatusBadge = ({ status }) => {
    const statusConfig = {
        'Scheduled': { label: 'Scheduled', color: 'bg-blue-50 text-blue-700 border-blue-200' },
        'InProgress': { label: 'In Progress', color: 'bg-purple-50 text-purple-700 border-purple-200' },
        'Completed': { label: 'Completed', color: 'bg-green-50 text-green-700 border-green-200' },
        'Cancelled': { label: 'Cancelled', color: 'bg-red-50 text-red-700 border-red-200' }
    };

    const config = statusConfig[status] || { label: status, color: 'bg-gray-50 text-gray-700 border-gray-200' };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wide border ${config.color}`}>
            {config.label}
        </span>
    );
};

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, link, isLoading, colorClass = "bg-blue-50 text-blue-600" }) => (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">{title}</p>
                {isLoading ? (
                    <div className="h-8 w-24 bg-gray-100 rounded animate-pulse"></div>
                ) : (
                    <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
                )}
            </div>
            <div className={`p-3 rounded-lg ${colorClass} bg-opacity-10 group-hover:scale-110 transition-transform`}>
                <Icon className={`h-6 w-6 ${colorClass.replace('bg-', 'text-').replace('bg-opacity-10', '')}`} />
            </div>
        </div>
        {link && (
            <div className="mt-4 pt-4 border-t border-gray-50">
                <Link to={link} className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 group-hover:gap-2 transition-all">
                    View Details <FiArrowRight className="h-4 w-4" />
                </Link>
            </div>
        )}
    </div>
);

// Loading Component
const Loader = ({ text }) => (
    <div className="flex flex-col justify-center items-center py-12 h-full">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-medium text-gray-500">{text}</p>
    </div>
);

// Empty State Component
const EmptyState = ({ message }) => (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="bg-gray-50 p-4 rounded-full mb-4">
            <FiClock className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">No Upcoming Interviews</h3>
        <p className="text-sm text-gray-500 max-w-sm">{message}</p>
    </div>
);

// Main Dashboard Component
const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    scheduledCount: 0,
    completedCount: 0,
    cancelledCount: 0,
    totalEarnings: 0,
  });
  const [upcomingInterviews, setUpcomingInterviews] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const res = await getMetrics();
        const data = res.data.data;
        setStats({
            scheduledCount: data.scheduledCount,
            completedCount: data.completedCount,
            cancelledCount: data.cancelledCount,
            totalEarnings: data.totalEarnings,
        });
        setUpcomingInterviews(data.upcomingInterviews || []);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#F5F7F9]">

      {/* Main Content Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
                title="Scheduled"
                value={stats.scheduledCount}
                icon={FiCalendar}
                link="/interviewer/interview-evaluation"
                isLoading={loading}
                colorClass="bg-blue-50 text-blue-600"
            />
            <StatCard
                title="Completed"
                value={stats.completedCount}
                icon={FiCheckCircle}
                isLoading={loading}
                colorClass="bg-green-50 text-green-600"
            />
            <StatCard
                title="Cancelled"
                value={stats.cancelledCount}
                icon={FiXCircle}
                isLoading={loading}
                colorClass="bg-red-50 text-red-600"
            />
            <StatCard
                title="Earnings"
                value={formatCurrency(stats.totalEarnings)}
                icon={FiDollarSign}
                link="/interviewer/payment-details"
                isLoading={loading}
                colorClass="bg-amber-50 text-amber-600"
            />
        </div>

        {/* Upcoming Interviews Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[calc(100%-180px)] min-h-[400px]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <FiCalendar className="text-gray-400" /> Upcoming Interviews
                </h2>
                <Link to="/interviewer/interview-evaluation" className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline">
                    View All
                </Link>
            </div>

            <div className="flex-1 overflow-auto">
                {loading ? (
                    <Loader text="Loading your schedule..." />
                ) : upcomingInterviews.length === 0 ? (
                    <EmptyState message="You don't have any interviews scheduled soon. Check back later or update your availability." />
                ) : (
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">Domain</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">Candidate</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">Time</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 bg-white">
                            {upcomingInterviews.map((interview, index) => (
                                <tr key={interview._id || index} className="hover:bg-blue-50/50 transition-colors group">
                                    <td className="px-6 py-4 font-semibold text-gray-900">{interview.techStack || '-'}</td>
                                    <td className="px-6 py-4 text-gray-600">{interview.candidateName || '-'}</td>
                                    <td className="px-6 py-4 text-gray-600">{formatDate(interview.interviewDate)}</td>
                                    <td className="px-6 py-4 font-mono text-xs text-gray-500">{interview.interviewTime || '-'}</td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={interview.interviewStatus} />
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link to={`/interviewer/interview/${interview._id}`} className="text-blue-600 hover:text-blue-800 font-semibold text-xs hover:underline">
                                            Open
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
