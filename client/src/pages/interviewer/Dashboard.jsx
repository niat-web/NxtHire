// client/src/pages/interviewer/Dashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useInterviewerMetrics } from '../../hooks/useInterviewerQueries';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { CheckCircle, IndianRupee, Calendar, XCircle, Clock, ArrowRight, Loader2, Briefcase, Star, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import Loader from '@/components/common/Loader';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '../../hooks/useAuth';

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.35 } }),
};

// ─── Small stat card (NxtResume exact pattern) ──────────────────────────────
const StatCard = ({ title, value, icon: Icon, link, isLoading, color = 'indigo' }) => {
  const palette = {
    indigo: 'bg-indigo-50 text-indigo-600',
    green:  'bg-green-50 text-green-600',
    red:    'bg-red-50 text-red-600',
    amber:  'bg-amber-50 text-amber-600',
    violet: 'bg-violet-50 text-violet-600',
    sky:    'bg-sky-50 text-sky-600',
  };

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', palette[color])}>
          <Icon size={18} />
        </div>
      </div>
      <div className="mt-2">
        {isLoading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        )}
      </div>
      {link && (
        <Link to={link} className="mt-2 inline-flex items-center text-gray-400 hover:text-indigo-600 transition-colors">
          <ArrowRight size={15} />
        </Link>
      )}
    </div>
  );
};

// ─── Status badge ────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const config = {
    Scheduled:  { label: 'Scheduled',   variant: 'info' },
    InProgress: { label: 'In Progress', variant: 'warning' },
    Completed:  { label: 'Completed',   variant: 'success' },
    Cancelled:  { label: 'Cancelled',   variant: 'danger' },
  };
  const c = config[status] || { label: status, variant: 'gray' };
  return <Badge variant={c.variant} className="text-xs font-medium">{c.label}</Badge>;
};

// ─── Quick action card ──────────────────────────────────────────────────────
const QuickAction = ({ title, description, icon: Icon, to, color = 'indigo' }) => {
  const palette = {
    indigo: 'bg-indigo-50 text-indigo-600',
    teal:   'bg-teal-50 text-teal-600',
    amber:  'bg-amber-50 text-amber-600',
  };

  return (
    <Link to={to} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md hover:border-indigo-200 group block">
      <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center mb-3', palette[color])}>
        <Icon size={18} />
      </div>
      <h3 className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{title}</h3>
      <p className="text-xs text-gray-400 mt-1">{description}</p>
    </Link>
  );
};

// ─── Main Dashboard ──────────────────────────────────────────────────────────
const Dashboard = () => {
  const { data, isLoading } = useInterviewerMetrics();
  const { currentUser } = useAuth();

  const stats = {
    scheduledCount: data?.scheduledCount ?? 0,
    completedCount: data?.completedCount ?? 0,
    cancelledCount: data?.cancelledCount ?? 0,
    totalEarnings: data?.totalEarnings ?? 0,
  };
  const upcomingInterviews = data?.upcomingInterviews ?? [];

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* Stat cards — compact grid */}
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" initial="hidden" animate="visible">
          <motion.div custom={0} variants={fadeIn}>
            <StatCard title="Scheduled" value={stats.scheduledCount} icon={Calendar} link="/interviewer/interview-evaluation" isLoading={isLoading} color="indigo" />
          </motion.div>
          <motion.div custom={1} variants={fadeIn}>
            <StatCard title="Completed" value={stats.completedCount} icon={CheckCircle} isLoading={isLoading} color="green" />
          </motion.div>
          <motion.div custom={2} variants={fadeIn}>
            <StatCard title="Cancelled" value={stats.cancelledCount} icon={XCircle} isLoading={isLoading} color="red" />
          </motion.div>
          <motion.div custom={3} variants={fadeIn}>
            <StatCard title="Total Earnings" value={formatCurrency(stats.totalEarnings)} icon={IndianRupee} link="/interviewer/payment-details" isLoading={isLoading} color="amber" />
          </motion.div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="text-base font-semibold text-gray-900 mb-3">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <QuickAction title="Set Availability" description="Update your available time slots" icon={Calendar} to="/interviewer/availability" color="indigo" />
            <QuickAction title="View Evaluations" description="Check domain evaluation sheets" icon={FileText} to="/interviewer/domain-evaluation" color="teal" />
            <QuickAction title="Update Profile" description="Keep your profile up to date" icon={Star} to="/interviewer/settings" color="amber" />
          </div>
        </motion.div>

        {/* Upcoming Interviews table */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-xl border border-gray-100 bg-white shadow-sm"
        >
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Upcoming Interviews</h3>
            <Link to="/interviewer/interview-evaluation" className="text-xs font-medium text-indigo-600 hover:text-indigo-800">View All</Link>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader size="md" />
            </div>
          ) : upcomingInterviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="bg-gray-50 p-3 rounded-full mb-3">
                <Clock className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">No Upcoming Interviews</h3>
              <p className="text-xs text-gray-500 max-w-sm">Check back later or update your availability.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50/80">
                  <tr>
                    <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Domain</th>
                    <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidate</th>
                    <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-2.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Meeting</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 bg-white">
                  {upcomingInterviews.map((interview, index) => (
                    <tr key={interview._id || index} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3 font-medium text-gray-900">{interview.techStack || '-'}</td>
                      <td className="px-5 py-3 text-gray-600">{interview.candidateName || '-'}</td>
                      <td className="px-5 py-3 text-gray-600">{formatDate(interview.interviewDate)}</td>
                      <td className="px-5 py-3 text-gray-500 text-xs">{interview.interviewTime || '-'}</td>
                      <td className="px-5 py-3"><StatusBadge status={interview.interviewStatus} /></td>
                      <td className="px-5 py-3 text-right">
                        {interview.meetingLink ? (
                          <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-medium hover:bg-indigo-100">Join</a>
                        ) : (
                          <span className="text-xs text-gray-300">No link</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
