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

const StatCard = ({ title, value, icon: Icon, link, isLoading, accent = false }) => {
  const Wrapper = link ? Link : 'div';
  const wrapperProps = link ? { to: link } : {};

  return (
    <Wrapper
      {...wrapperProps}
      className={`group relative block rounded-lg p-5 transition-colors shadow-brave-card ${
        accent
          ? 'bg-primary/5 border-2 border-primary/40 hover:border-primary'
          : 'bg-card border border-border hover:border-primary/40'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <p className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${accent ? 'text-primary' : 'text-muted-foreground'}`}>{title}</p>
        <div className={`h-8 w-8 rounded-md inline-flex items-center justify-center ${accent ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
          <Icon size={14} />
        </div>
      </div>
      <div>
        {isLoading ? (
          <Skeleton className="h-9 w-24" />
        ) : (
          <p className={`font-display text-[32px] font-bold tracking-tight leading-none tabular-nums ${accent ? 'text-primary' : 'text-foreground'}`}>{value}</p>
        )}
      </div>
      {link && (
        <div className="mt-4 inline-flex items-center gap-1 text-[12px] font-semibold text-muted-foreground group-hover:text-primary transition-colors">
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
  <Link to={to} className="group relative rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary/40 shadow-brave-card block">
    <div className="h-10 w-10 rounded-md bg-primary/10 text-primary inline-flex items-center justify-center">
      <Icon size={16} />
    </div>
    <h3 className="font-display mt-5 text-[18px] font-bold text-foreground group-hover:text-primary transition-colors tracking-tight">{title}</h3>
    <p className="text-[13px] text-muted-foreground mt-1.5 leading-relaxed">{description}</p>
    <ArrowRight size={14} className="absolute top-6 right-6 text-muted-foreground/40 group-hover:text-primary transition-colors" />
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
    <div className="flex flex-col h-full bg-background">
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
            <StatCard title="Total Earnings" value={formatCurrency(stats.totalEarnings)} icon={IndianRupee} link="/interviewer/payment-details" isLoading={isLoading} accent />
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-[2px]" style={{ backgroundColor: 'var(--brave-amber)' }} />
              Quick Actions
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <QuickAction title="Set availability" description="Update your available time slots" icon={Calendar} to="/interviewer/availability" />
            <QuickAction title="View evaluations" description="Check domain evaluation sheets" icon={FileText} to="/interviewer/domain-evaluation" />
            <QuickAction title="Update profile" description="Keep your profile up to date" icon={Star} to="/interviewer/settings" />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-lg border border-border bg-card shadow-brave-card overflow-hidden"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-md bg-primary/10 text-primary inline-flex items-center justify-center">
                <Briefcase size={14} />
              </div>
              <div>
                <h3 className="font-display text-[15px] font-semibold text-foreground tracking-tight">Upcoming interviews</h3>
                <p className="text-[11.5px] text-muted-foreground mt-0.5">Your scheduled sessions</p>
              </div>
            </div>
            <Link to="/interviewer/interview-evaluation" className="text-[12px] font-semibold text-muted-foreground hover:text-primary flex items-center gap-0.5 transition-colors">View all <ArrowRight size={12} /></Link>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-14">
              <Loader size="md" />
            </div>
          ) : upcomingInterviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
              <div className="h-12 w-12 rounded-md bg-primary/10 text-primary inline-flex items-center justify-center mb-4">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="font-display text-[18px] font-bold text-foreground mb-1.5 tracking-tight">No upcoming interviews</h3>
              <p className="text-[13px] text-muted-foreground max-w-sm">Check back later or update your availability to get matched with candidates.</p>
              <Link to="/interviewer/availability" className="mt-5 inline-flex h-10 items-center gap-1.5 rounded-md bg-primary px-4 text-[12.5px] font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                Set availability <ArrowRight size={12} />
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-[13px]">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="px-6 py-3 text-left text-[10.5px] font-semibold text-muted-foreground uppercase tracking-[0.18em]">Domain</th>
                    <th className="px-6 py-3 text-left text-[10.5px] font-semibold text-muted-foreground uppercase tracking-[0.18em]">Candidate</th>
                    <th className="px-6 py-3 text-left text-[10.5px] font-semibold text-muted-foreground uppercase tracking-[0.18em]">Date</th>
                    <th className="px-6 py-3 text-left text-[10.5px] font-semibold text-muted-foreground uppercase tracking-[0.18em]">Time</th>
                    <th className="px-6 py-3 text-left text-[10.5px] font-semibold text-muted-foreground uppercase tracking-[0.18em]">Status</th>
                    <th className="px-6 py-3 text-right text-[10.5px] font-semibold text-muted-foreground uppercase tracking-[0.18em]">Meeting</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {upcomingInterviews.map((interview, index) => (
                    <tr key={interview._id || index} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-3.5 font-semibold text-foreground">{interview.techStack || '-'}</td>
                      <td className="px-6 py-3.5 text-foreground/90">{interview.candidateName || '-'}</td>
                      <td className="px-6 py-3.5 text-foreground/90 tabular-nums">{formatDate(interview.interviewDate)}</td>
                      <td className="px-6 py-3.5 text-muted-foreground tabular-nums">{interview.interviewTime || '-'}</td>
                      <td className="px-6 py-3.5"><StatusBadge status={interview.interviewStatus} /></td>
                      <td className="px-6 py-3.5 text-right">
                        {interview.meetingLink ? (
                          <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer" className="h-8 rounded-md bg-primary text-primary-foreground text-[12px] font-semibold px-3 hover:bg-primary/90 transition-colors inline-flex items-center gap-1">
                            Join <ArrowRight size={11} />
                          </a>
                        ) : (
                          <span className="text-[12px] text-muted-foreground/40">No link</span>
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
