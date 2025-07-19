// client/src/pages/interviewer/Dashboard.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import { getMetrics } from '../../api/interviewer.api';
import { useAuth } from '../../hooks/useAuth';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { FiCheckCircle, FiDollarSign, FiCalendar, FiArrowRight } from 'react-icons/fi';

const StatCard = ({ title, value, icon, footerText, link, isLoading }) => (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
        <div>
            <div className="flex items-center justify-between">
                <p className="text-base font-semibold text-gray-500">{title}</p>
                <div className="p-2 bg-primary-100 rounded-lg text-primary-600">
                  {icon}
                </div>
            </div>
            {isLoading ? (
                <div className="h-10 w-32 bg-gray-200 animate-pulse rounded mt-2"></div>
            ) : (
                <p className="text-4xl font-bold text-gray-900 mt-2">{value}</p>
            )}
        </div>
        {link && (
            <Link to={link} className="text-sm font-medium text-primary-600 hover:underline mt-4 flex items-center">
                {footerText}
                <FiArrowRight className="ml-1 h-4 w-4" />
            </Link>
        )}
    </div>
);

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const metricsRes = await getMetrics();
        setMetrics(metricsRes.data);
      } catch (error) {
        console.error("Failed to load interviewer dashboard", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const upcomingInterviewsColumns = useMemo(() => [
    { key: 'candidate', title: 'Candidate' },
    { key: 'date', title: 'Date', render: (row) => formatDateTime(row.date) },
    { key: 'time', title: 'Time' },
    { key: 'status', title: 'Status' },
    { key: 'actions', title: 'Actions', render: () => <Button variant="outline" size="sm">View Details</Button> },
  ], []);

  // Since there is no API to fetch scheduled interviews, we'll keep this array empty.
  const scheduledInterviews = [];

  if (loading) return <div className="flex justify-center py-20"><Loader text="Loading Dashboard..." /></div>;

  return (
    <div className="space-y-8">

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Note: 'Interviews Scheduled' data is not available from the current API, so it's shown as 0. */}
        <StatCard title="Interviews Scheduled" value="0" icon={<FiCalendar size={22} />} footerText="View calendar" link="/interviewer/availability" isLoading={loading} />
        <StatCard title="Interviews Completed" value={metrics?.metrics?.interviewsCompleted || 0} icon={<FiCheckCircle size={22} />} footerText="View history" link="#" isLoading={loading} />
        <StatCard title="Total Earnings" value={formatCurrency(metrics?.metrics?.totalEarnings || 0)} icon={<FiDollarSign size={22} />} footerText="View payment details" link="/interviewer/profile" isLoading={loading} />
      </div>

      <Card title="Upcoming Interviews" bodyClassName="p-0">
          <Table 
              columns={upcomingInterviewsColumns}
              data={scheduledInterviews}
              isLoading={loading}
              emptyMessage="You have no upcoming interviews scheduled."
          />
      </Card>
    </div>
  );
};

export default Dashboard;