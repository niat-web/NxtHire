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
import { sendProbationEmail, markProbationAsSent } from '../../api/admin.api';
import { useDashboardStats, useApplicants, useInvalidateAdmin } from '../../hooks/useAdminQueries';
import { useAlert } from '../../hooks/useAlert';
import { formatCurrency, formatDate, formatTime } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';
import AnalyticsDashboard from '../../components/admin/AnalyticsDashboard';
import { cn } from '@/lib/utils';
import Loader from '@/components/common/Loader';

// ── inline status badge ─────────────────────────────────────────────────────
const statusColorMap = {
  'Application Submitted': 'bg-blue-50 text-blue-700',
  'Under Review': 'bg-amber-50 text-amber-700',
  'Profile Approved': 'bg-emerald-50 text-emerald-700',
  'Profile Rejected': 'bg-red-50 text-red-700',
  'Skills Assessment Sent': 'bg-blue-50 text-blue-700',
  'Skills Assessment Completed': 'bg-violet-50 text-violet-700',
  'Guidelines Sent': 'bg-blue-50 text-blue-700',
  'Guidelines Reviewed': 'bg-violet-50 text-violet-700',
  'Guidelines Failed': 'bg-red-50 text-red-700',
  'Onboarded': 'bg-emerald-50 text-emerald-700',
  'Active Interviewer': 'bg-emerald-50 text-emerald-700',
  'On Probation': 'bg-amber-50 text-amber-700',
  'Active': 'bg-emerald-50 text-emerald-700',
  'Inactive': 'bg-slate-100 text-slate-600',
  'Suspended': 'bg-red-50 text-red-700',
  'Pending': 'bg-amber-50 text-amber-700',
  'Completed': 'bg-emerald-50 text-emerald-700',
  'Cancelled': 'bg-red-50 text-red-700',
};
const statusLabelMap = {
  'Application Submitted': 'Submitted',
  'Skills Assessment Sent': 'Assessment Sent',
  'Skills Assessment Completed': 'Assessment Done',
  'Guidelines Reviewed': 'Guidelines Reviewed',
  'Guidelines Failed': 'Guidelines Failed',
  'Active Interviewer': 'Active Interviewer',
  'On Probation': 'On Probation',
  'Pending': 'Pending Review',
};
const InlineStatusBadge = ({ status }) => {
  const colorClass = statusColorMap[status] || 'bg-slate-100 text-slate-600';
  const label = statusLabelMap[status] || status;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${colorClass}`}>
      {label}
    </span>
  );
};

// ── animation ────────────────────────────────────────────────────────────────
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

// ── Metric Card ──────────────────────────────────────────────────────────────
const MetricCard = ({ label, value, icon: Icon, href, color, isLoading, isSensitive, change }) => {
  const [show, setShow] = useState(!isSensitive);
  const colors = {
    blue:    { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
    amber:   { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
    violet:  { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-100' },
    rose:    { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100' },
    sky:     { bg: 'bg-sky-50', text: 'text-sky-600', border: 'border-sky-100' },
  };
  const c = colors[color] || colors.blue;

  const Wrapper = href ? Link : 'div';
  const wrapperProps = href ? { to: href } : {};

  return (
    <Wrapper {...wrapperProps} className="group relative rounded-xl bg-white border border-slate-200 px-5 py-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-slate-300 block overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center border', c.bg, c.text, c.border)}>
          <Icon size={18} strokeWidth={2} />
        </div>
        {href && (
          <ArrowUpRight size={15} className="text-slate-300 group-hover:text-blue-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
        )}
      </div>

      {isLoading ? (
        <div className="h-7 w-16 mb-0.5 bg-slate-100 rounded animate-pulse" />
      ) : (
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-slate-900 tracking-tight">
            {isSensitive && !show ? '••••' : value}
          </span>
          {isSensitive && (
            <button onClick={(e) => { e.preventDefault(); setShow(v => !v); }} className="text-slate-300 hover:text-slate-500">
              {show ? <EyeOff size={12} /> : <Eye size={12} />}
            </button>
          )}
        </div>
      )}

      <p className="text-[11px] font-semibold text-slate-500 mt-1 uppercase tracking-wide">{label}</p>
    </Wrapper>
  );
};

// ── Activity Item ────────────────────────────────────────────────────────────
const ActivityItem = ({ avatar, name, detail, badge, action }) => (
  <div className="flex items-center gap-3 py-3 px-1 border-b border-slate-100 last:border-0 group">
    <div className="h-9 w-9 shrink-0 rounded-lg bg-blue-50 flex items-center justify-center text-blue-700 text-xs font-semibold">
      {avatar}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-slate-900 truncate">{name}</p>
      <p className="text-xs text-slate-400 truncate">{detail}</p>
    </div>
    {badge && <div className="shrink-0">{badge}</div>}
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

// ── Schedule Item ────────────────────────────────────────────────────────────
const ScheduleItem = ({ interview }) => (
  <div className="flex items-center gap-3 py-3 px-1 border-b border-slate-100 last:border-0">
    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
      <Calendar size={16} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-slate-900 truncate">{interview.candidateName}</p>
      <p className="text-xs text-slate-400">
        {formatDate(interview.interviewDate)}
        {interview.interviewTime && (
          <span className="ml-1 text-slate-300">&middot;</span>
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
        className="shrink-0 px-3 h-8 inline-flex items-center text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
      >
        Join
      </a>
    ) : (
      <span className="text-xs text-slate-300 shrink-0">–</span>
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
    <div className="flex items-center gap-3 py-3 px-1 border-b border-slate-100 last:border-0">
      <div className="h-9 w-9 shrink-0 rounded-lg bg-rose-50 flex items-center justify-center text-rose-700 text-xs font-semibold">
        {interviewer?.user?.firstName?.[0]}{interviewer?.user?.lastName?.[0]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 truncate">
          {interviewer?.user?.firstName} {interviewer?.user?.lastName}
        </p>
        <p className="text-xs text-slate-400">{interviewer.metrics?.interviewsCompleted} completed</p>
      </div>
      <div className="flex gap-1 shrink-0">
        <button onClick={send} disabled={busy} className="h-7 w-7 rounded-lg flex items-center justify-center text-blue-600 hover:bg-blue-50 disabled:opacity-40 transition-colors" title="Send email">
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
  <div className={cn('bg-white rounded-xl border border-slate-200 overflow-hidden', className)}>
    <div className="flex items-center justify-between px-5 py-4">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center">
            <Icon size={16} className="text-slate-500" />
          </div>
        )}
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          {subtitle && <p className="text-[11px] text-slate-400 font-medium">{subtitle}</p>}
        </div>
      </div>
      {href && (
        <Link to={href} className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 transition-colors">
          {linkLabel || 'View all'} <ChevronRight size={14} />
        </Link>
      )}
    </div>
    <div className="border-t border-slate-100 px-5 py-3">{children}</div>
  </div>
);

// ── Hiring Pipeline Mini ─────────────────────────────────────────────────────
const PipelineStat = ({ label, count, color }) => (
  <div className="flex items-center justify-between py-2.5 px-1 border-b border-slate-100 last:border-0">
    <div className="flex items-center gap-2">
      <div className={cn('w-2 h-2 rounded-full', color)} />
      <span className="text-sm text-slate-600">{label}</span>
    </div>
    <span className="text-sm font-semibold text-slate-900">{count}</span>
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
    <motion.div
      className="flex-1 flex flex-col overflow-y-auto bg-[#f5f7fb]"
      initial="hidden"
      animate="visible"
      variants={stagger}
    >
      <div className="px-5 py-5 space-y-4">

        {statsError && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">
            <AlertCircle size={16} /> Failed to load dashboard data.
          </div>
        )}

        {/* ── Metric Cards ─────────────────────────────────────────────────── */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <MetricCard label="Total Applicants"    value={stats.totalApplicants ?? 0}        icon={Users}          href="/admin/hiring/applicants"    color="blue"  isLoading={loading} />
          <MetricCard label="Active Interviewers" value={stats.activeInterviewers ?? 0}     icon={UserCheck}      href="/admin/interviewers"         color="emerald" isLoading={loading} />
          <MetricCard label="Pending Reviews"     value={stats.pendingReviews ?? 0}         icon={ClipboardCheck} href="/admin/hiring/linkedin-review" color="amber" isLoading={loading} />
          <MetricCard label="Platform Earnings"   value={formatCurrency(stats.totalPlatformEarnings || 0)} icon={IndianRupee} href="/admin/earnings-report" color="violet" isLoading={loading} isSensitive />
          <MetricCard label="Interviews"          value={upcomingInterviews.length}          icon={Calendar}       href="/admin/main-sheet"           color="sky"     isLoading={loading} />
          <MetricCard label="On Probation"        value={stats.probationInterviewers ?? 0}  icon={TrendingUp}                                        color="rose"    isLoading={loading} />
        </motion.div>

        {/* ── Pipeline + Analytics ─────────────────────────────────────────── */}
        <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          <Panel title="Hiring Pipeline" subtitle="Review queue" icon={Briefcase} href="/admin/hiring/applicants" className="lg:col-span-4">
            <PipelineStat label="LinkedIn Reviews"   count={stats.pendingLinkedInReviews ?? 0} color="bg-blue-500" />
            <PipelineStat label="Skills Assessment"  count={stats.pendingSkillsReview ?? 0}    color="bg-amber-500" />
            <PipelineStat label="Guidelines Review"  count={stats.pendingGuidelinesReview ?? 0} color="bg-violet-500" />
            <PipelineStat label="Probation Reviews"  count={probationReviewList.length}        color="bg-rose-500" />
          </Panel>

          <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-5 overflow-hidden">
            <AnalyticsDashboard />
          </div>
        </motion.div>

        {/* ── Bottom: 3-column layout ──────────────────────────────────────── */}
        <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-3 gap-3">

          {/* Recent Applicants */}
          <Panel title="Recent Applicants" icon={Users} href="/admin/hiring/applicants">
            {recentApplicants.length > 0 ? (
              recentApplicants.map(a => (
                <ActivityItem
                  key={a._id}
                  avatar={a.fullName?.[0] || '?'}
                  name={a.fullName}
                  detail={a.email}
                  badge={<InlineStatusBadge status={a.status} />}
                />
              ))
            ) : (
              <p className="py-8 text-center text-sm text-slate-400">No recent applicants</p>
            )}
          </Panel>

          {/* Upcoming Interviews */}
          <Panel title="Upcoming Interviews" icon={Calendar} href="/admin/main-sheet" linkLabel="View sheet">
            {upcomingInterviews.length > 0 ? (
              upcomingInterviews.map(iv => <ScheduleItem key={iv._id} interview={iv} />)
            ) : (
              <p className="py-8 text-center text-sm text-slate-400">No upcoming interviews</p>
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
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center mx-auto mb-2">
                  <Check size={18} className="text-emerald-600" />
                </div>
                <p className="text-sm font-medium text-slate-900">All clear</p>
                <p className="text-xs text-slate-400 mt-0.5">No pending probation reviews</p>
              </div>
            )}
          </Panel>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
