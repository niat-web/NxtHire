import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, ClipboardCheck, UserCheck, IndianRupee,
  Eye, EyeOff, Mail, Check, Calendar, RefreshCw,
  ArrowUpRight, TrendingUp, Loader2, Clock, Briefcase,
  FileText, ChevronRight, ArrowRight, BarChart3, Zap,
  AlertCircle, Plus,
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import { sendProbationEmail, markProbationAsSent } from '../../api/admin.api';
import { useDashboardStats, useApplicants, useInvalidateAdmin } from '../../hooks/useAdminQueries';
import { useAlert } from '../../hooks/useAlert';
import { formatCurrency, formatDate, formatTime } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';
import AnalyticsDashboard from '../../components/admin/AnalyticsDashboard';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Loader from '@/components/common/Loader';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

// ── animation ────────────────────────────────────────────────────────────────
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

// ── Metric Card ──────────────────────────────────────────────────────────────
const MetricCard = ({ label, value, icon: Icon, href, color, isLoading, isSensitive, change }) => {
  const [show, setShow] = useState(!isSensitive);
  const colors = {
    indigo:  { bg: 'bg-indigo-500/10', text: 'text-indigo-600', ring: 'ring-indigo-500/20' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', ring: 'ring-emerald-500/20' },
    amber:   { bg: 'bg-amber-500/10', text: 'text-amber-600', ring: 'ring-amber-500/20' },
    violet:  { bg: 'bg-violet-500/10', text: 'text-violet-600', ring: 'ring-violet-500/20' },
    rose:    { bg: 'bg-rose-500/10', text: 'text-rose-600', ring: 'ring-rose-500/20' },
    sky:     { bg: 'bg-sky-500/10', text: 'text-sky-600', ring: 'ring-sky-500/20' },
  };
  const c = colors[color] || colors.indigo;

  const Wrapper = href ? Link : 'div';
  const wrapperProps = href ? { to: href } : {};

  return (
    <Wrapper {...wrapperProps} className="group relative rounded-xl bg-white border border-gray-100 px-4 py-3 transition-all duration-200 hover:shadow-md hover:border-gray-200 block">
      <div className="flex items-center justify-between mb-2">
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center ring-1', c.bg, c.text, c.ring)}>
          <Icon size={16} strokeWidth={1.8} />
        </div>
        {href && (
          <ArrowUpRight size={14} className="text-gray-300 group-hover:text-indigo-500 transition-colors" />
        )}
      </div>

      {isLoading ? (
        <Skeleton className="h-6 w-16 mb-0.5" />
      ) : (
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-bold text-gray-900 tracking-tight">
            {isSensitive && !show ? '••••' : value}
          </span>
          {isSensitive && (
            <button onClick={(e) => { e.preventDefault(); setShow(v => !v); }} className="text-gray-300 hover:text-gray-500">
              {show ? <EyeOff size={12} /> : <Eye size={12} />}
            </button>
          )}
        </div>
      )}

      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </Wrapper>
  );
};

// ── Activity Item ────────────────────────────────────────────────────────────
const ActivityItem = ({ avatar, name, detail, badge, action }) => (
  <div className="flex items-center gap-3 py-3 px-1 border-b border-gray-50 last:border-0 group">
    <Avatar className="h-9 w-9 shrink-0 ring-2 ring-white">
      <AvatarFallback className="bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-700 text-xs font-semibold">
        {avatar}
      </AvatarFallback>
    </Avatar>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
      <p className="text-xs text-gray-400 truncate">{detail}</p>
    </div>
    {badge && <div className="shrink-0">{badge}</div>}
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

// ── Schedule Item ────────────────────────────────────────────────────────────
const ScheduleItem = ({ interview }) => (
  <div className="flex items-center gap-3 py-3 px-1 border-b border-gray-50 last:border-0">
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-sky-50 text-indigo-600 flex items-center justify-center shrink-0">
      <Calendar size={16} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-900 truncate">{interview.candidateName}</p>
      <p className="text-xs text-gray-400">
        {formatDate(interview.interviewDate)}
        {interview.interviewTime && (
          <span className="ml-1 text-gray-300">&middot;</span>
        )}
        {interview.interviewTime && (
          <span className="ml-1">{interview.interviewTime.split('-').map(t => formatTime(t.trim())).join(' – ')}</span>
        )}
      </p>
    </div>
    {interview.meetingLink ? (
      <a
        href={interview.meetingLink}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
      >
        Join
      </a>
    ) : (
      <span className="text-xs text-gray-300 shrink-0">–</span>
    )}
  </div>
);

// ── Probation Row ────────────────────────────────────────────────────────────
const ProbationRow = ({ interviewer, onRefresh }) => {
  const { showSuccess, showError } = useAlert();
  const [busy, setBusy] = useState(false);

  const send = async () => {
    setBusy(true);
    try {
      await sendProbationEmail(interviewer._id);
      showSuccess('Email sent.');
      onRefresh();
    } catch { showError('Failed.'); }
    finally { setBusy(false); }
  };

  const mark = async () => {
    setBusy(true);
    try {
      await markProbationAsSent(interviewer._id);
      showSuccess('Marked.');
      onRefresh();
    } catch { showError('Failed.'); }
    finally { setBusy(false); }
  };

  return (
    <div className="flex items-center gap-3 py-3 px-1 border-b border-gray-50 last:border-0">
      <Avatar className="h-9 w-9 shrink-0">
        <AvatarFallback className="bg-rose-100 text-rose-700 text-xs font-semibold">
          {interviewer?.user?.firstName?.[0]}{interviewer?.user?.lastName?.[0]}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {interviewer?.user?.firstName} {interviewer?.user?.lastName}
        </p>
        <p className="text-xs text-gray-400">{interviewer.metrics?.interviewsCompleted} completed</p>
      </div>
      <div className="flex gap-1 shrink-0">
        <button onClick={send} disabled={busy} className="h-7 w-7 rounded-lg flex items-center justify-center text-indigo-600 hover:bg-indigo-50 disabled:opacity-40 transition-colors" title="Send email">
          {busy ? <Loader2 size={13} className="animate-spin" /> : <Mail size={13} />}
        </button>
        <button onClick={mark} disabled={busy} className="h-7 w-7 rounded-lg flex items-center justify-center text-emerald-600 hover:bg-emerald-50 disabled:opacity-40 transition-colors" title="Mark sent">
          <Check size={13} />
        </button>
      </div>
    </div>
  );
};

// ── Panel Card ───────────────────────────────────────────────────────────────
const Panel = ({ title, subtitle, href, linkLabel, icon: Icon, children, className = '' }) => (
  <div className={cn('bg-white rounded-2xl border border-gray-100 overflow-hidden', className)}>
    <div className="flex items-center justify-between px-5 py-4">
      <div className="flex items-center gap-2.5">
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
            <Icon size={15} className="text-gray-400" />
          </div>
        )}
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
        </div>
      </div>
      {href && (
        <Link to={href} className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors">
          {linkLabel || 'View all'} <ChevronRight size={14} />
        </Link>
      )}
    </div>
    <div className="border-t border-gray-50 px-5 py-3">{children}</div>
  </div>
);

// ── Quick Action ─────────────────────────────────────────────────────────────
const QuickAction = ({ label, icon: Icon, to, color = 'indigo' }) => {
  const colors = {
    indigo: 'bg-indigo-600 hover:bg-indigo-700',
    emerald: 'bg-emerald-600 hover:bg-emerald-700',
    amber: 'bg-amber-500 hover:bg-amber-600',
  };
  return (
    <Link to={to} className={cn('flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-colors shadow-sm', colors[color])}>
      <Icon size={16} /> {label}
    </Link>
  );
};

// ── Hiring Pipeline Mini ─────────────────────────────────────────────────────
const PipelineStat = ({ label, count, color }) => (
  <div className="flex items-center justify-between py-2.5 px-1 border-b border-gray-50 last:border-0">
    <div className="flex items-center gap-2">
      <div className={cn('w-2 h-2 rounded-full', color)} />
      <span className="text-sm text-gray-600">{label}</span>
    </div>
    <span className="text-sm font-semibold text-gray-900">{count}</span>
  </div>
);

// ══════════════════════════════════════════════════════════════════════════════
// ── MAIN DASHBOARD ───────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
const Dashboard = () => {
  const { currentUser } = useAuth();
  const { invalidateDashboard, invalidateApplicants } = useInvalidateAdmin();
  const { data: stats = {}, isLoading: loading, error: statsError, isFetching } = useDashboardStats();
  const { data: applicantsData } = useApplicants(
    { limit: 5, sortBy: 'createdAt', sortOrder: 'desc' },
    { staleTime: 2 * 60 * 1000 }
  );

  const recentApplicants = applicantsData?.applicants || [];
  const upcomingInterviews = stats.upcomingInterviews || [];
  const probationReviewList = stats.probationReviewList || [];

  const refresh = () => { invalidateDashboard(); invalidateApplicants(); };

  // Full-screen loader on first load
  if (loading && !stats.totalApplicants) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="xl" />
      </div>
    );
  }

  return (
    <motion.div className="space-y-6 pb-10" initial="hidden" animate="visible" variants={stagger}>

      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Platform overview</p>
        </div>

        <div className="flex items-center gap-3">
          <QuickAction label="New Interview" icon={Plus} to="/admin/bookings/new" color="indigo" />
          <Button variant="outline" onClick={refresh} disabled={isFetching} className="rounded-xl h-10">
            <RefreshCw size={15} className={cn('mr-2', isFetching && 'animate-spin')} />
            {isFetching ? 'Refreshing…' : 'Refresh'}
          </Button>
        </div>
      </motion.div>

      {statsError && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">
          <AlertCircle size={16} /> Failed to load dashboard data.
        </div>
      )}

      {/* ── Metric Cards (3 cols × 2 rows) ────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard label="Total Applicants"    value={stats.totalApplicants ?? 0}        icon={Users}          href="/admin/hiring/applicants"    color="indigo"  isLoading={loading} />
        <MetricCard label="Active Interviewers" value={stats.activeInterviewers ?? 0}     icon={UserCheck}      href="/admin/interviewers"         color="emerald" isLoading={loading} />
        <MetricCard label="Pending Reviews"     value={stats.pendingReviews ?? 0}         icon={ClipboardCheck} href="/admin/hiring/linkedin-review" color="amber" isLoading={loading} />
        <MetricCard label="Platform Earnings"   value={formatCurrency(stats.totalPlatformEarnings || 0)} icon={IndianRupee} href="/admin/earnings-report" color="violet" isLoading={loading} isSensitive />
        <MetricCard label="Interviews"          value={upcomingInterviews.length}          icon={Calendar}       href="/admin/main-sheet"           color="sky"     isLoading={loading} />
        <MetricCard label="On Probation"        value={stats.probationInterviewers ?? 0}  icon={TrendingUp}                                        color="rose"    isLoading={loading} />
      </motion.div>

      {/* ── Hiring Pipeline + Quick Stats ─────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Panel title="Hiring Pipeline" subtitle="Review queue" icon={Briefcase} href="/admin/hiring/applicants" className="lg:col-span-1">
          <PipelineStat label="LinkedIn Reviews" count={stats.pendingLinkedInReviews ?? 0} color="bg-blue-500" />
          <PipelineStat label="Skills Assessment" count={stats.pendingSkillsReview ?? 0} color="bg-amber-500" />
          <PipelineStat label="Guidelines Review" count={stats.pendingGuidelinesReview ?? 0} color="bg-violet-500" />
          <PipelineStat label="Probation Reviews" count={probationReviewList.length} color="bg-rose-500" />
        </Panel>

        {/* Interview Trends chart (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 overflow-hidden">
          <AnalyticsDashboard />
        </div>
      </motion.div>

      {/* ── Bottom: 3-column layout ───────────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Recent Applicants */}
        <Panel title="Recent Applicants" icon={Users} href="/admin/hiring/applicants">
          {recentApplicants.length > 0 ? (
            recentApplicants.map(a => (
              <ActivityItem
                key={a._id}
                avatar={a.fullName?.[0] || '?'}
                name={a.fullName}
                detail={a.email}
                badge={<StatusBadge status={a.status} />}
              />
            ))
          ) : (
            <p className="py-8 text-center text-sm text-gray-400">No recent applicants</p>
          )}
        </Panel>

        {/* Upcoming Interviews */}
        <Panel title="Upcoming Interviews" icon={Calendar} href="/admin/main-sheet" linkLabel="View sheet">
          {upcomingInterviews.length > 0 ? (
            upcomingInterviews.map(iv => <ScheduleItem key={iv._id} interview={iv} />)
          ) : (
            <p className="py-8 text-center text-sm text-gray-400">No upcoming interviews</p>
          )}
        </Panel>

        {/* Probation Reviews */}
        <Panel title="Probation Reviews" icon={AlertCircle} subtitle={`${probationReviewList.length} pending`}>
          {probationReviewList.length > 0 ? (
            probationReviewList.map(i => (
              <ProbationRow key={i._id} interviewer={i} onRefresh={refresh} />
            ))
          ) : (
            <div className="py-8 text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-2">
                <Check size={18} className="text-emerald-600" />
              </div>
              <p className="text-sm font-medium text-gray-900">All clear</p>
              <p className="text-xs text-gray-400 mt-0.5">No pending probation reviews</p>
            </div>
          )}
        </Panel>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
