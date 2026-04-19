import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, ClipboardCheck, UserCheck, IndianRupee,
  Eye, EyeOff, Mail, Check, Calendar,
  ArrowUpRight, TrendingUp, Loader2, Briefcase,
  ChevronRight, AlertCircle,
} from 'lucide-react';
import { sendProbationEmail, markProbationAsSent } from '../../api/admin.api';
import { useDashboardStats, useApplicants, useInvalidateAdmin } from '../../hooks/useAdminQueries';
import { useAlert } from '../../hooks/useAlert';
import { formatCurrency, formatDate, formatTime } from '../../utils/formatters';
import AnalyticsDashboard from '../../components/admin/AnalyticsDashboard';
import { cn } from '@/lib/utils';
import Loader from '@/components/common/Loader';

const ACCENT = '#FF4800';
const DISPLAY = { fontFamily: 'Fraunces, Georgia, serif' };

const statusMeaningMap = {
  'Profile Approved': 'success',
  'Profile Rejected': 'danger',
  'Onboarded': 'success',
  'Active Interviewer': 'success',
  'Active': 'success',
  'Under Review': 'warning',
  'On Probation': 'warning',
  'Pending': 'warning',
  'Completed': 'success',
  'Cancelled': 'danger',
  'Guidelines Failed': 'danger',
  'Suspended': 'danger',
  'Inactive': 'neutral',
};
const statusLabelMap = {
  'Application Submitted': 'Submitted',
  'Skills Assessment Sent': 'Assessment Sent',
  'Skills Assessment Completed': 'Assessment Done',
  'Pending': 'Pending Review',
};
const InlineStatusBadge = ({ status }) => {
  const meaning = statusMeaningMap[status] || 'neutral';
  const label = statusLabelMap[status] || status;
  const classes = {
    success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    warning: 'border-amber-200 bg-amber-50 text-amber-800',
    danger:  'border-red-200 bg-red-50 text-red-700',
    neutral: 'border-slate-200 bg-slate-50 text-slate-600',
  }[meaning];
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${classes}`}>
      {label}
    </span>
  );
};

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.04 } } };
const fadeUp = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

const MetricCard = ({ label, value, icon: Icon, href, isLoading, isSensitive }) => {
  const [show, setShow] = useState(!isSensitive);

  const Wrapper = href ? Link : 'div';
  const wrapperProps = href ? { to: href } : {};

  return (
    <Wrapper {...wrapperProps} className="group relative rounded-2xl bg-white border border-slate-200 px-5 py-5 transition-colors hover:border-slate-900 block">
      <div className="flex items-center justify-between mb-4">
        <div className="h-9 w-9 rounded-full border border-slate-200 bg-white inline-flex items-center justify-center text-slate-700">
          <Icon size={15} strokeWidth={2} />
        </div>
        {href && (
          <ArrowUpRight size={14} className="text-slate-300 group-hover:text-slate-900 transition-colors" />
        )}
      </div>

      {isLoading ? (
        <div className="h-8 w-20 mb-1 bg-slate-100 rounded animate-pulse" />
      ) : (
        <div className="flex items-baseline gap-1.5">
          <span style={DISPLAY} className="text-[28px] font-semibold text-slate-900 tracking-tight leading-none">
            {isSensitive && !show ? '••••' : value}
          </span>
          {isSensitive && (
            <button onClick={(e) => { e.preventDefault(); setShow(v => !v); }} className="text-slate-300 hover:text-slate-700">
              {show ? <EyeOff size={12} /> : <Eye size={12} />}
            </button>
          )}
        </div>
      )}

      <p className="text-[10.5px] font-semibold text-slate-500 mt-3 uppercase tracking-[0.15em]">{label}</p>
    </Wrapper>
  );
};

const ActivityItem = ({ avatar, name, detail, badge, action }) => (
  <div className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0 group">
    <div className="h-9 w-9 shrink-0 rounded-full bg-slate-900 flex items-center justify-center text-white text-[12px] font-semibold">
      {avatar}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[13px] font-semibold text-slate-900 truncate">{name}</p>
      <p className="text-[12px] text-slate-500 truncate">{detail}</p>
    </div>
    {badge && <div className="shrink-0">{badge}</div>}
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

const ScheduleItem = ({ interview }) => (
  <div className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0">
    <div className="w-9 h-9 rounded-full border border-slate-200 bg-white text-slate-700 flex items-center justify-center shrink-0">
      <Calendar size={14} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[13px] font-semibold text-slate-900 truncate">{interview.candidateName}</p>
      <p className="text-[12px] text-slate-500">
        {formatDate(interview.interviewDate)}
        {interview.interviewTime && <span className="mx-1 text-slate-300">·</span>}
        {interview.interviewTime && (
          <span>{interview.interviewTime.split('-').map(t => formatTime(t.trim())).join(' – ')}</span>
        )}
      </p>
    </div>
    {interview.meetingLink ? (
      <a
        href={interview.meetingLink}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 h-8 inline-flex items-center px-3 text-[12px] font-semibold rounded-full border border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white transition-colors"
      >
        Join
      </a>
    ) : (
      <span className="text-[12px] text-slate-300 shrink-0">–</span>
    )}
  </div>
);

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
    <div className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0">
      <div className="h-9 w-9 shrink-0 rounded-full bg-slate-900 flex items-center justify-center text-white text-[12px] font-semibold">
        {interviewer?.user?.firstName?.[0]}{interviewer?.user?.lastName?.[0]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-slate-900 truncate">
          {interviewer?.user?.firstName} {interviewer?.user?.lastName}
        </p>
        <p className="text-[12px] text-slate-500">{interviewer.metrics?.interviewsCompleted} completed</p>
      </div>
      <div className="flex gap-1 shrink-0">
        <button onClick={send} disabled={busy} className="h-8 w-8 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 transition-colors" title="Send email">
          {busy ? <Loader2 size={13} className="animate-spin" /> : <Mail size={13} />}
        </button>
        <button onClick={mark} disabled={busy} className="h-8 w-8 rounded-full flex items-center justify-center text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-40 transition-colors" title="Mark sent">
          <Check size={13} />
        </button>
      </div>
    </div>
  );
};

const Panel = ({ title, subtitle, href, linkLabel, icon: Icon, children, className = '' }) => (
  <div className={cn('bg-white rounded-2xl border border-slate-200 overflow-hidden', className)}>
    <div className="flex items-center justify-between px-5 py-4">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="h-9 w-9 rounded-full border border-slate-200 bg-white inline-flex items-center justify-center text-slate-700">
            <Icon size={14} />
          </div>
        )}
        <div>
          <h3 className="text-[14px] font-semibold text-slate-900 tracking-tight">{title}</h3>
          {subtitle && <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {href && (
        <Link to={href} className="text-[12px] font-semibold text-slate-700 hover:text-[#FF4800] flex items-center gap-0.5 transition-colors">
          {linkLabel || 'View all'} <ChevronRight size={13} />
        </Link>
      )}
    </div>
    <div className="border-t border-slate-100 px-5 py-2">{children}</div>
  </div>
);

const PipelineStat = ({ label, count }) => (
  <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
    <div className="flex items-center gap-2.5">
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: ACCENT }} />
      <span className="text-[13px] text-slate-700">{label}</span>
    </div>
    <span style={DISPLAY} className="text-[18px] font-semibold text-slate-900 tracking-tight">{count}</span>
  </div>
);

const Dashboard = () => {
  const { invalidateDashboard, invalidateApplicants } = useInvalidateAdmin();
  const { data: stats = {}, isLoading: loading, error: statsError } = useDashboardStats();
  const { data: applicantsData } = useApplicants(
    { limit: 5, sortBy: 'createdAt', sortOrder: 'desc' },
    { staleTime: 2 * 60 * 1000 }
  );

  const recentApplicants = applicantsData?.applicants || [];
  const upcomingInterviews = stats.upcomingInterviews || [];
  const probationReviewList = stats.probationReviewList || [];

  const refresh = () => { invalidateDashboard(); invalidateApplicants(); };

  if (loading && !stats.totalApplicants) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="xl" />
      </div>
    );
  }

  return (
    <motion.div
      className="flex-1 flex flex-col overflow-y-auto bg-[#FAFAF9]"
      initial="hidden"
      animate="visible"
      variants={stagger}
    >
      <div className="px-6 py-6 lg:px-10 lg:py-8 space-y-5 max-w-7xl w-full mx-auto">

        {statsError && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-red-50 border border-red-200 text-[13px] text-red-700">
            <AlertCircle size={14} /> Failed to load dashboard data.
          </div>
        )}

        <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <MetricCard label="Total Applicants"    value={stats.totalApplicants ?? 0}        icon={Users}          href="/admin/hiring/applicants"    isLoading={loading} />
          <MetricCard label="Active Interviewers" value={stats.activeInterviewers ?? 0}     icon={UserCheck}      href="/admin/interviewers"         isLoading={loading} />
          <MetricCard label="Pending Reviews"     value={stats.pendingReviews ?? 0}         icon={ClipboardCheck} href="/admin/hiring/linkedin-review" isLoading={loading} />
          <MetricCard label="Platform Earnings"   value={formatCurrency(stats.totalPlatformEarnings || 0)} icon={IndianRupee} href="/admin/earnings-report" isLoading={loading} isSensitive />
          <MetricCard label="Interviews"          value={upcomingInterviews.length}          icon={Calendar}       href="/admin/main-sheet"           isLoading={loading} />
          <MetricCard label="On Probation"        value={stats.probationInterviewers ?? 0}  icon={TrendingUp}                                        isLoading={loading} />
        </motion.div>

        <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          <Panel title="Hiring pipeline" subtitle="Review queue" icon={Briefcase} href="/admin/hiring/applicants" className="lg:col-span-4">
            <PipelineStat label="LinkedIn reviews"   count={stats.pendingLinkedInReviews ?? 0} />
            <PipelineStat label="Skills assessment"  count={stats.pendingSkillsReview ?? 0} />
            <PipelineStat label="Guidelines review"  count={stats.pendingGuidelinesReview ?? 0} />
            <PipelineStat label="Probation reviews"  count={probationReviewList.length} />
          </Panel>

          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-5 overflow-hidden">
            <AnalyticsDashboard />
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-3 gap-3">

          <Panel title="Recent applicants" icon={Users} href="/admin/hiring/applicants">
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
              <p className="py-8 text-center text-[13px] text-slate-500">No recent applicants</p>
            )}
          </Panel>

          <Panel title="Upcoming interviews" icon={Calendar} href="/admin/main-sheet" linkLabel="View sheet">
            {upcomingInterviews.length > 0 ? (
              upcomingInterviews.map(iv => <ScheduleItem key={iv._id} interview={iv} />)
            ) : (
              <p className="py-8 text-center text-[13px] text-slate-500">No upcoming interviews</p>
            )}
          </Panel>

          <Panel title="Probation reviews" icon={AlertCircle} subtitle={`${probationReviewList.length} pending`}>
            {probationReviewList.length > 0 ? (
              probationReviewList.map(i => (
                <ProbationRow key={i._id} interviewer={i} onRefresh={refresh} />
              ))
            ) : (
              <div className="py-8 text-center">
                <div className="h-10 w-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-2 text-emerald-600">
                  <Check size={16} />
                </div>
                <p className="text-[13px] font-semibold text-slate-900">All clear</p>
                <p className="text-[12px] text-slate-500 mt-0.5">No pending probation reviews</p>
              </div>
            )}
          </Panel>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
