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

// ─── Small stat card ──────────────────────────────────────────────────────
const StatCard = ({ title, value, icon: Icon, link, isLoading, color = 'blue' }) => {
  const palette = {
    blue:   { grad: 'from-blue-500 to-blue-600', chip: 'bg-blue-50 text-blue-600 ring-blue-200/60' },
    green:  { grad: 'from-emerald-500 to-teal-500', chip: 'bg-emerald-50 text-emerald-600 ring-emerald-200/60' },
    red:    { grad: 'from-rose-500 to-pink-500', chip: 'bg-rose-50 text-rose-600 ring-rose-200/60' },
    amber:  { grad: 'from-amber-500 to-orange-500', chip: 'bg-amber-50 text-amber-600 ring-amber-200/60' },
    violet: { grad: 'from-violet-500 to-fuchsia-500', chip: 'bg-violet-50 text-violet-600 ring-violet-200/60' },
    sky:    { grad: 'from-sky-500 to-blue-500', chip: 'bg-sky-50 text-sky-600 ring-sky-200/60' },
  };
  const c = palette[color] || palette.blue;

  const Wrapper = link ? Link : 'div';
  const wrapperProps = link ? { to: link } : {};

  return (
    <Wrapper {...wrapperProps} className="group relative block rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-0.5 transition-all overflow-hidden">
      <div className={cn('absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r', c.grad)} />
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{title}</p>
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center ring-1 shadow-sm', c.chip)}>
          <Icon size={18} />
        </div>
      </div>
      <div>
        {isLoading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</p>
        )}
      </div>
      {link && (
        <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 group-hover:gap-1.5 transition-all">
          View details <ArrowRight size={12} />
        </div>
      )}
    </Wrapper>
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
const QuickAction = ({ title, description, icon: Icon, to, color = 'blue' }) => {
  const palette = {
    blue:   'bg-blue-50 text-blue-600 ring-blue-200/60',
    teal:   'bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-600 ring-emerald-200/60',
    amber:  'bg-gradient-to-br from-amber-50 to-orange-50 text-amber-600 ring-amber-200/60',
  };

  return (
    <Link to={to} className="group relative rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-lg hover:shadow-blue-100/40 hover:-translate-y-0.5 hover:border-blue-200 block overflow-hidden">
      <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center mb-4 ring-1 shadow-sm', palette[color])}>
        <Icon size={19} />
      </div>
      <h3 className="text-[15px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{title}</h3>
      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{description}</p>
      <ArrowRight size={14} className="absolute top-5 right-5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
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
    <div className="flex flex-col h-full bg-slate-50">
      <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">

        {/* Stat cards — compact grid */}
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" initial="hidden" animate="visible">
          <motion.div custom={0} variants={fadeIn}>
            <StatCard title="Scheduled" value={stats.scheduledCount} icon={Calendar} link="/interviewer/interview-evaluation" isLoading={isLoading} color="blue" />
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
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-base font-bold text-slate-900">Quick Actions</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <QuickAction title="Set Availability" description="Update your available time slots" icon={Calendar} to="/interviewer/availability" color="blue" />
            <QuickAction title="View Evaluations" description="Check domain evaluation sheets" icon={FileText} to="/interviewer/domain-evaluation" color="teal" />
            <QuickAction title="Update Profile" description="Keep your profile up to date" icon={Star} to="/interviewer/settings" color="amber" />
          </div>
        </motion.div>

        {/* Upcoming Interviews table */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 ring-1 ring-blue-200/60 flex items-center justify-center">
                <Briefcase size={16} className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Upcoming Interviews</h3>
                <p className="text-[11px] text-slate-400 font-medium">Your scheduled sessions</p>
              </div>
            </div>
            <Link to="/interviewer/interview-evaluation" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5">View all <ArrowRight size={12} /></Link>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader size="md" />
            </div>
          ) : upcomingInterviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200/60 flex items-center justify-center mb-4 shadow-sm">
                <Clock className="h-6 w-6 text-slate-400" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">No upcoming interviews</h3>
              <p className="text-xs text-slate-500 max-w-sm">Check back later or update your availability to get matched with candidates.</p>
              <Link to="/interviewer/availability" className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700">
                Set availability <ArrowRight size={12} />
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50/80">
                  <tr>
                    <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-[0.12em]">Domain</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-[0.12em]">Candidate</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-[0.12em]">Date</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-[0.12em]">Time</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-[0.12em]">Status</th>
                    <th className="px-6 py-3 text-right text-[10px] font-bold text-slate-500 uppercase tracking-[0.12em]">Meeting</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {upcomingInterviews.map((interview, index) => (
                    <tr key={interview._id || index} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-3.5 font-semibold text-slate-900">{interview.techStack || '-'}</td>
                      <td className="px-6 py-3.5 text-slate-600">{interview.candidateName || '-'}</td>
                      <td className="px-6 py-3.5 text-slate-600">{formatDate(interview.interviewDate)}</td>
                      <td className="px-6 py-3.5 text-slate-500 text-xs">{interview.interviewTime || '-'}</td>
                      <td className="px-6 py-3.5"><StatusBadge status={interview.interviewStatus} /></td>
                      <td className="px-6 py-3.5 text-right">
                        {interview.meetingLink ? (
                          <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer" className="px-3 h-8 rounded-md bg-blue-600 text-white text-xs font-medium shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all inline-flex items-center gap-1">
                            Join <ArrowRight size={11} />
                          </a>
                        ) : (
                          <span className="text-xs text-slate-300">No link</span>
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
