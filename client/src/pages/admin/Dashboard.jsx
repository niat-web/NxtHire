import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, ClipboardCheck, UserCheck, IndianRupee,
  Eye, EyeOff, Mail, Check, Calendar,
  ArrowRight, Activity, TrendingUp, Loader2,
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import { sendProbationEmail, markProbationAsSent } from '../../api/admin.api';
import { useDashboardStats, useApplicants, useInvalidateAdmin } from '../../hooks/useAdminQueries';
import { useAlert } from '../../hooks/useAlert';
import { formatCurrency, formatDate, formatTime } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';
import AnalyticsDashboard from '../../components/admin/AnalyticsDashboard';

// ─── Simple stat card (reference-style) ──────────────────────────────────────
const StatCard = ({ title, value, icon, linkTo, color = 'blue', isLoading, isSensitive = false }) => {
  const [visible, setVisible] = useState(!isSensitive);

  const palette = {
    blue:   'bg-emerald-50 text-emerald-600',
    orange: 'bg-emerald-50 text-emerald-600',
    teal:   'bg-teal-50 text-teal-600',
    purple: 'bg-violet-50 text-violet-600',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-start gap-4 hover:shadow-sm transition-shadow">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${palette[color]}`}>
        {React.cloneElement(icon, { size: 20 })}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-500 mb-1">{title}</p>
        {isLoading ? (
          <div className="h-7 w-20 bg-gray-100 animate-pulse rounded" />
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-gray-900 leading-none">
              {isSensitive && !visible ? '--------' : value}
            </span>
            {isSensitive && (
              <button
                onClick={() => setVisible(v => !v)}
                className="text-gray-400 hover:text-gray-600"
              >
                {visible ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            )}
          </div>
        )}
      </div>

      <Link to={linkTo} className="text-gray-300 hover:text-gray-500 transition-colors mt-1">
        <ArrowRight size={18} />
      </Link>
    </div>
  );
};

// ─── Probation row ───────────────────────────────────────────────────────────
const ProbationReviewRow = ({ interviewer, onRefresh }) => {
  const { showSuccess, showError } = useAlert();
  const [sendingMail, setSendingMail] = useState(false);
  const [markingSent, setMarkingSent] = useState(false);

  const handleSendEmail = async () => {
    setSendingMail(true);
    try {
      await sendProbationEmail(interviewer._id);
      showSuccess(`Probation email sent to ${interviewer.user.firstName}.`);
      onRefresh();
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to send email.');
    } finally {
      setSendingMail(false);
    }
  };

  const handleMarkAsSent = async () => {
    setMarkingSent(true);
    try {
      await markProbationAsSent(interviewer._id);
      showSuccess('Marked as sent.');
      onRefresh();
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to update.');
    } finally {
      setMarkingSent(false);
    }
  };

  const initials = `${interviewer.user.firstName[0]}${interviewer.user.lastName[0]}`;

  return (
    <li className="flex items-center justify-between gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {interviewer.user.firstName} {interviewer.user.lastName}
          </p>
          <p className="text-xs text-gray-400">
            <span className="font-medium text-gray-600">{interviewer.metrics.interviewsCompleted}</span> interviews
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={handleSendEmail}
          disabled={sendingMail || markingSent}
          className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-40"
          title="Send Probation Email"
        >
          {sendingMail
            ? <Loader2 size={15} className="animate-spin" />
            : <Mail size={15} />}
        </button>
        <button
          onClick={handleMarkAsSent}
          disabled={sendingMail || markingSent}
          className="p-2 rounded-lg text-teal-600 hover:bg-teal-50 transition-colors disabled:opacity-40"
          title="Mark as Sent"
        >
          {markingSent
            ? <Loader2 size={15} className="animate-spin" />
            : <Check size={15} />}
        </button>
      </div>
    </li>
  );
};

// ─── Recent applicant row ────────────────────────────────────────────────────
const RecentApplicantRow = ({ applicant }) => (
  <li className="flex items-center justify-between gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
    <div className="flex items-center gap-3 min-w-0">
      <div className="w-9 h-9 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-bold shrink-0">
        {applicant.fullName[0]}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{applicant.fullName}</p>
        <p className="text-xs text-gray-400 truncate">{applicant.email}</p>
      </div>
    </div>
    <StatusBadge status={applicant.status} />
  </li>
);

// ─── Upcoming interview row ──────────────────────────────────────────────────
const UpcomingInterviewRow = ({ interview }) => (
  <li className="flex items-center justify-between gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
    <div className="flex items-center gap-3 min-w-0">
      <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
        <Calendar size={16} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{interview.candidateName}</p>
        <p className="text-xs text-gray-400">
          {formatDate(interview.interviewDate)}
          {interview.interviewTime && (
            <> &middot; {interview.interviewTime.split('-').map(t => formatTime(t.trim())).join(' - ')}</>
          )}
        </p>
      </div>
    </div>
    {interview.meetingLink ? (
      <a
        href={interview.meetingLink}
        target="_blank"
        rel="noopener noreferrer"
        className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-semibold hover:bg-emerald-100 transition-colors shrink-0"
      >
        Join
      </a>
    ) : (
      <span className="text-xs text-gray-300 shrink-0">No link</span>
    )}
  </li>
);

// ─── Section wrapper ─────────────────────────────────────────────────────────
const Section = ({ title, icon: Icon, linkTo, linkLabel, children, className = '' }) => (
  <div className={`bg-white rounded-xl border border-gray-100 overflow-hidden ${className}`}>
    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
      <div className="flex items-center gap-2.5">
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
            <Icon size={16} className="text-gray-500" />
          </div>
        )}
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      </div>
      {linkTo && (
        <Link
          to={linkTo}
          className="text-xs font-medium text-gray-500 hover:text-emerald-500 transition-colors"
        >
          {linkLabel || 'View All'}
        </Link>
      )}
    </div>
    <div className="p-4">{children}</div>
  </div>
);

// ─── Main Dashboard ──────────────────────────────────────────────────────────
const Dashboard = () => {
  const { currentUser } = useAuth();
  const { invalidateDashboard, invalidateApplicants } = useInvalidateAdmin();

  const { data: stats = {}, isLoading: statsLoading, error: statsError } = useDashboardStats();
  const { data: applicantsData } = useApplicants(
    { limit: 5, sortBy: 'createdAt', sortOrder: 'desc' },
    { staleTime: 2 * 60 * 1000 }
  );

  const loading = statsLoading;
  const error = statsError ? 'Failed to load dashboard data.' : '';
  const recentApplicants = applicantsData?.applicants || [];
  const upcomingInterviews = stats.upcomingInterviews || [];
  const probationReviewList = stats.probationReviewList || [];

  const fetchDashboardData = () => {
    invalidateDashboard();
    invalidateApplicants();
  };

  if (loading && !stats.totalApplicants) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={28} className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Welcome back, {currentUser.firstName}. Here's your overview.
          </p>
        </div>
        <Link
          to="/admin/bookings/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <Calendar size={16} /> Schedule Interview
        </Link>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Applicants" value={stats.totalApplicants ?? '0'} icon={<Users />} linkTo="/admin/hiring/applicants" color="blue" isLoading={loading} />
        <StatCard title="Pending Reviews" value={stats.pendingReviews ?? '0'} icon={<ClipboardCheck />} linkTo="/admin/hiring/linkedin-review" color="orange" isLoading={loading} />
        <StatCard title="Active Interviewers" value={stats.activeInterviewers ?? '0'} icon={<UserCheck />} linkTo="/admin/interviewers" color="teal" isLoading={loading} />
        <StatCard title="Total Earnings" value={formatCurrency(stats.totalPlatformEarnings || 0)} icon={<IndianRupee />} linkTo="/admin/earnings-report" color="purple" isLoading={loading} isSensitive />
      </div>

      {/* Analytics + Probation row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5">
          <AnalyticsDashboard />
        </div>

        <Section
          title="Probation Review"
          icon={TrendingUp}
          className="flex flex-col"
        >
          {loading && probationReviewList.length === 0 ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 size={20} className="animate-spin text-gray-300" />
            </div>
          ) : probationReviewList.length > 0 ? (
            <ul className="space-y-1 max-h-[400px] overflow-y-auto">
              {probationReviewList.map(i => (
                <ProbationReviewRow key={i._id} interviewer={i} onRefresh={fetchDashboardData} />
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
              <ClipboardCheck size={28} className="mb-2 opacity-40" />
              <p className="text-sm font-medium text-gray-500">All caught up</p>
              <p className="text-xs mt-1">No pending reviews.</p>
            </div>
          )}
        </Section>
      </div>

      {/* Bottom row — applicants + upcoming interviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Section title="Recent Applicants" icon={Users} linkTo="/admin/hiring/applicants">
          {loading && recentApplicants.length === 0 ? (
            <p className="text-center py-8 text-sm text-gray-400">Loading...</p>
          ) : recentApplicants.length > 0 ? (
            <ul className="space-y-1">
              {recentApplicants.map(a => <RecentApplicantRow key={a._id} applicant={a} />)}
            </ul>
          ) : (
            <p className="py-10 text-center text-sm text-gray-400">No recent applicants.</p>
          )}
        </Section>

        <Section title="Upcoming Interviews" icon={Calendar} linkTo="/admin/main-sheet" linkLabel="View Sheet">
          {loading && upcomingInterviews.length === 0 ? (
            <p className="text-center py-8 text-sm text-gray-400">Loading...</p>
          ) : upcomingInterviews.length > 0 ? (
            <ul className="space-y-1">
              {upcomingInterviews.map(iv => <UpcomingInterviewRow key={iv._id} interview={iv} />)}
            </ul>
          ) : (
            <p className="py-10 text-center text-sm text-gray-400">No upcoming interviews.</p>
          )}
        </Section>
      </div>
    </div>
  );
};

export default Dashboard;
