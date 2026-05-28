import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useInterviewerMetrics } from '../../hooks/useInterviewerQueries';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { CheckCircle, IndianRupee, Calendar, XCircle, Clock, ArrowRight, Briefcase, Star, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Loader from '@/components/common/Loader';
import { Skeleton } from '@/components/ui/skeleton';

const ACCENT = '#C0392B';
const DISPLAY = { fontFamily: 'Supreme, "Plus Jakarta Sans", system-ui, sans-serif' };

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.35 } }),
};

const StatCard = ({ title, value, icon: Icon, link, isLoading }) => {
  const Wrapper = link ? Link : 'div';
  const wrapperProps = link ? { to: link } : {};

  return (
    <Wrapper {...wrapperProps} className="group relative block rounded-2xl border border-slate-200 bg-white p-5 transition-colors hover:border-slate-900">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10.5px] font-semibold text-slate-500 uppercase tracking-[0.2em]">{title}</p>
        <div className="h-9 w-9 rounded-full border border-slate-200 bg-white inline-flex items-center justify-center text-slate-700">
          <Icon size={15} />
        </div>
      </div>
      <div>
        {isLoading ? (
          <Skeleton className="h-9 w-24" />
        ) : (
          <p style={DISPLAY} className="text-[32px] font-semibold text-slate-900 tracking-tight leading-none">{value}</p>
        )}
      </div>
      {link && (
        <div className="mt-4 inline-flex items-center gap-1 text-[12px] font-semibold text-slate-700 group-hover:text-[#C0392B] transition-colors">
          View details <ArrowRight size={12} />
        </div>
      )}
    </Wrapper>
  );
};

const StatusBadge = ({ status }) => {
  const config = {
    Scheduled:  { label: 'Scheduled',   variant: 'info' },
    InProgress: { label: 'In Progress', variant: 'warning' },
    Completed:  { label: 'Completed',   variant: 'success' },
    Cancelled:  { label: 'Cancelled',   variant: 'danger' },
  };
  const c = config[status] || { label: status, variant: 'gray' };
  return <Badge variant={c.variant}>{c.label}</Badge>;
};

const QuickAction = ({ title, description, icon: Icon, to }) => (
  <Link to={to} className="group relative rounded-2xl border border-slate-200 bg-white p-6 transition-colors hover:border-slate-900 block">
    <div className="h-10 w-10 rounded-full border border-slate-200 bg-white inline-flex items-center justify-center text-slate-700">
      <Icon size={15} />
    </div>
    <h3 style={DISPLAY} className="mt-5 text-[18px] font-semibold text-slate-900 group-hover:text-[#C0392B] transition-colors tracking-tight">{title}</h3>
    <p className="text-[13px] text-slate-600 mt-1.5 leading-relaxed">{description}</p>
    <ArrowRight size={14} className="absolute top-6 right-6 text-slate-300 group-hover:text-slate-900 transition-colors" />
  </Link>
);

const Dashboard = () => {
  const { data, isLoading } = useInterviewerMetrics();

  const stats = {
    scheduledCount: data?.scheduledCount ?? 0,
    completedCount: data?.completedCount ?? 0,
    cancelledCount: data?.cancelledCount ?? 0,
    totalEarnings: data?.totalEarnings ?? 0,
  };
  const upcomingInterviews = data?.upcomingInterviews ?? [];

  return (
    <div className="flex flex-col h-full bg-[#fcfaf8]">
      <div className="flex-1 overflow-y-auto px-6 py-6 lg:px-10 lg:py-8 space-y-6 max-w-7xl w-full mx-auto">

        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" initial="hidden" animate="visible">
          <motion.div custom={0} variants={fadeIn}>
            <StatCard title="Scheduled" value={stats.scheduledCount} icon={Calendar} link="/interviewer/interview-evaluation" isLoading={isLoading} />
          </motion.div>
          <motion.div custom={1} variants={fadeIn}>
            <StatCard title="Completed" value={stats.completedCount} icon={CheckCircle} isLoading={isLoading} />
          </motion.div>
          <motion.div custom={2} variants={fadeIn}>
            <StatCard title="Cancelled" value={stats.cancelledCount} icon={XCircle} isLoading={isLoading} />
          </motion.div>
          <motion.div custom={3} variants={fadeIn}>
            <StatCard title="Total Earnings" value={formatCurrency(stats.totalEarnings)} icon={IndianRupee} link="/interviewer/payment-details" isLoading={isLoading} />
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.2em] text-slate-600">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: ACCENT }} />
              Quick Actions
            </span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <QuickAction title="Set availability" description="Update your available time slots" icon={Calendar} to="/interviewer/availability" />
            <QuickAction title="View evaluations" description="Check domain evaluation sheets" icon={FileText} to="/interviewer/domain-evaluation" />
            <QuickAction title="Update profile" description="Keep your profile up to date" icon={Star} to="/interviewer/settings" />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-2xl border border-slate-200 bg-white overflow-hidden"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full border border-slate-200 bg-white inline-flex items-center justify-center text-slate-700">
                <Briefcase size={14} />
              </div>
              <div>
                <h3 className="text-[14px] font-semibold text-slate-900 tracking-tight">Upcoming interviews</h3>
                <p className="text-[11.5px] text-slate-500 mt-0.5">Your scheduled sessions</p>
              </div>
            </div>
            <Link to="/interviewer/interview-evaluation" className="text-[12px] font-semibold text-slate-700 hover:text-[#C0392B] flex items-center gap-0.5 transition-colors">View all <ArrowRight size={12} /></Link>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-14">
              <Loader size="md" />
            </div>
          ) : upcomingInterviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
              <div className="h-12 w-12 rounded-full border border-slate-200 bg-white inline-flex items-center justify-center mb-4 text-slate-400">
                <Clock className="h-5 w-5" />
              </div>
              <h3 style={DISPLAY} className="text-[18px] font-semibold text-slate-900 mb-1.5 tracking-tight">No upcoming interviews</h3>
              <p className="text-[13px] text-slate-500 max-w-sm">Check back later or update your availability to get matched with candidates.</p>
              <Link to="/interviewer/availability" className="mt-5 inline-flex h-10 items-center gap-1.5 rounded-full border border-slate-900 px-4 text-[12.5px] font-semibold text-slate-900 hover:bg-slate-900 hover:text-white transition-colors">
                Set availability <ArrowRight size={12} />
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-[13px]">
                <thead className="bg-slate-50/70">
                  <tr>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-[0.15em]">Domain</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-[0.15em]">Candidate</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-[0.15em]">Date</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-[0.15em]">Time</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-[0.15em]">Status</th>
                    <th className="px-6 py-3 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-[0.15em]">Meeting</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {upcomingInterviews.map((interview, index) => (
                    <tr key={interview._id || index} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-3.5 font-semibold text-slate-900">{interview.techStack || '-'}</td>
                      <td className="px-6 py-3.5 text-slate-700">{interview.candidateName || '-'}</td>
                      <td className="px-6 py-3.5 text-slate-700">{formatDate(interview.interviewDate)}</td>
                      <td className="px-6 py-3.5 text-slate-500">{interview.interviewTime || '-'}</td>
                      <td className="px-6 py-3.5"><StatusBadge status={interview.interviewStatus} /></td>
                      <td className="px-6 py-3.5 text-right">
                        {interview.meetingLink ? (
                          <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer" className="h-8 rounded-full bg-slate-900 text-white text-[12px] font-semibold px-3 hover:bg-[#C0392B] transition-colors inline-flex items-center gap-1">
                            Join <ArrowRight size={11} />
                          </a>
                        ) : (
                          <span className="text-[12px] text-slate-300">No link</span>
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
