import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Users, CheckSquare, UserCheck, DollarSign, Eye, EyeOff, Mail, Check, Calendar, TrendingUp, ArrowRight, Activity, Sparkles } from 'lucide-react';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import { getApplicants, getDashboardStats, sendProbationEmail, markProbationAsSent } from '../../api/admin.api';
import { useAlert } from '../../hooks/useAlert';
import { formatCurrency, formatDate, formatTime } from '../../utils/formatters';
import Alert from '../../components/common/Alert';
import { useAuth } from '../../hooks/useAuth';
import AnalyticsDashboard from '../../components/admin/AnalyticsDashboard'; 

// Enhanced Premium Stat Card
const StatCard = ({ title, value, icon, linkTo, color = "blue", isLoading, isSensitive = false }) => {
    const [isVisible, setIsVisible] = useState(!isSensitive);
    
    const colors = {
        blue: { 
            bg: "from-blue-500/10 to-blue-600/5", 
            border: "border-blue-200/60",
            text: "text-blue-700", 
            icon: "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25",
            glow: "group-hover:shadow-blue-500/20"
        },
        orange: { 
            bg: "from-orange-500/10 to-orange-600/5", 
            border: "border-orange-200/60",
            text: "text-orange-700", 
            icon: "bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25",
            glow: "group-hover:shadow-orange-500/20"
        },
        teal: { 
            bg: "from-teal-500/10 to-teal-600/5", 
            border: "border-teal-200/60",
            text: "text-teal-700", 
            icon: "bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/25",
            glow: "group-hover:shadow-teal-500/20"
        },
        purple: { 
            bg: "from-violet-500/10 to-violet-600/5", 
            border: "border-violet-200/60",
            text: "text-violet-700", 
            icon: "bg-gradient-to-br from-violet-500 to-violet-600 text-white shadow-lg shadow-violet-500/25",
            glow: "group-hover:shadow-violet-500/20"
        },
    };

    const theme = colors[color] || colors.blue;
  
    const valueDisplay = useMemo(() => {
      if (isLoading) {
        return <div className="h-9 w-28 bg-slate-200/70 animate-pulse rounded-lg"></div>;
      }
      if (!isSensitive) {
        return <p className="text-4xl font-black text-slate-900 leading-none tracking-tight">{value}</p>;
      }
      return (
        <div className="flex items-center gap-3">
          <p className="text-4xl font-black text-slate-900 leading-none tracking-tight">
            {isVisible ? value : '••••••••'}
          </p>
          <button
            onClick={() => setIsVisible(!isVisible)}
            className="text-slate-400 hover:text-slate-700 focus:outline-none transition-all hover:scale-110"
            title={isVisible ? "Hide value" : "Show value"}
          >
            {isVisible ? <EyeOff size={20} strokeWidth={2.5} /> : <Eye size={20} strokeWidth={2.5} />}
          </button>
        </div>
      );
    }, [isLoading, isSensitive, isVisible, value]);
  
    return (
      <div className={`group relative bg-white rounded-2xl p-5 border ${theme.border} hover:border-${color}-300/80 shadow-sm hover:shadow-xl ${theme.glow} hover:-translate-y-0.5 transition-all duration-300 h-full flex flex-col overflow-hidden`}>
        <div className={`absolute inset-0 bg-gradient-to-br ${theme.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`} />
        
        <div className="relative flex items-start justify-between mb-2">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 leading-tight">{title}</h3>
            <div className={`p-3.5 rounded-xl ${theme.icon} transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                {React.cloneElement(icon, { size: 20, strokeWidth: 2.5 })}
            </div>
        </div>
        
        <div className="relative mt-auto flex items-end justify-between gap-3">
            <div className="flex-1 min-w-0">
                {valueDisplay}
            </div>
            <Link 
                to={linkTo} 
                className={`flex items-center gap-1.5 text-xs font-black ${theme.text} opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 whitespace-nowrap hover:gap-2`}
            >
                View <ArrowRight size={14} strokeWidth={3} />
            </Link>
        </div>
      </div>
    );
};

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
            showSuccess('Successfully marked as sent!');
            onRefresh();
        } catch (error) {
            showError(error.response?.data?.message || 'Failed to update.');
        } finally {
            setMarkingSent(false);
        }
    };

    return (
        <li className="flex items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-br from-white to-slate-50/50 border border-slate-200/60 hover:border-orange-300/60 hover:shadow-lg hover:shadow-orange-100/50 transition-all duration-300 group">
            <div className="flex items-center gap-3">
                <div className="relative">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-orange-500/25 group-hover:scale-105 transition-transform duration-300">
                        {interviewer.user.firstName[0]}{interviewer.user.lastName[0]}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-teal-500 rounded-full border-2 border-white shadow-sm"></div>
                </div>
                <div>
                    <p className="font-bold text-slate-900 text-sm leading-tight">{`${interviewer.user.firstName} ${interviewer.user.lastName}`}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                        <Activity size={13} className="text-teal-600" strokeWidth={2.5} />
                        <span className="font-bold text-slate-700">{interviewer.metrics.interviewsCompleted}</span> 
                        <span className="text-slate-400">interviews completed</span>
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-2 opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                <button
                    onClick={handleSendEmail}
                    disabled={sendingMail || markingSent}
                    className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 shadow-md hover:shadow-lg hover:shadow-blue-500/30 hover:scale-105 disabled:hover:scale-100"
                    title="Send Probation Completion Email"
                >
                    {sendingMail ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Mail size={16} strokeWidth={2.5} />}
                </button>
                <button
                    onClick={handleMarkAsSent}
                    disabled={sendingMail || markingSent}
                    className="p-2.5 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700 transition-all duration-300 disabled:opacity-50 shadow-md hover:shadow-lg hover:shadow-teal-500/30 hover:scale-105 disabled:hover:scale-100"
                    title="Manually Mark as Sent"
                >
                    {markingSent ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Check size={16} strokeWidth={2.5} />}
                </button>
            </div>
        </li>
    );
};

const RecentApplicantRow = ({ applicant }) => (
    <li className="p-4 flex items-center justify-between gap-4 rounded-xl bg-gradient-to-br from-white to-slate-50/30 border border-slate-200/60 hover:border-blue-300/60 hover:shadow-lg hover:shadow-blue-50 transition-all duration-300 group">
        <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-700 font-black text-sm shadow-sm group-hover:scale-105 transition-transform duration-300">
                {applicant.fullName[0]}
            </div>
            <div>
                <p className="font-bold text-slate-900 text-sm leading-tight">{applicant.fullName}</p>
                <p className="text-xs text-slate-500 mt-0.5">{applicant.email}</p>
            </div>
        </div>
        <StatusBadge status={applicant.status} />
    </li>
);

const UpcomingInterviewRow = ({ interview }) => (
    <li className="p-4 rounded-xl bg-gradient-to-br from-white to-slate-50/30 border border-slate-200/60 hover:border-teal-300/60 hover:shadow-lg hover:shadow-teal-50 transition-all duration-300 grid grid-cols-3 gap-4 items-center group">
        <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-300">
                <Calendar size={18} strokeWidth={2.5} />
            </div>
            <div>
                <p className="font-bold text-slate-900 text-sm leading-tight">{interview.candidateName}</p>
                <p className="text-xs text-slate-500 mt-0.5">Candidate</p>
            </div>
        </div>
        <div>
            <p className="font-bold text-slate-800 text-sm">{formatDate(interview.interviewDate)}</p>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
                {interview.interviewTime ? interview.interviewTime.split('-').map(t => formatTime(t.trim())).join(' - ') : ''}
            </p>
        </div>
        {interview.meetingLink ? (
            <a 
                href={interview.meetingLink} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="px-4 py-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs font-black hover:from-blue-600 hover:to-blue-700 transition-all duration-300 justify-self-end shadow-md hover:shadow-lg hover:shadow-blue-500/30 hover:scale-105"
            >
                Join Meeting
            </a>
        ) : (
            <span className="text-xs text-slate-400 italic justify-self-end px-4 py-2">No link</span>
        )}
    </li>
);

const Dashboard = () => {
  const [stats, setStats] = useState({});
  const [recentApplicants, setRecentApplicants] = useState([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState([]);
  const [probationReviewList, setProbationReviewList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();
  const { showSuccess } = useAlert();
  
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [statsRes, applicantsRes] = await Promise.all([
        getDashboardStats(),
        getApplicants({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' })
      ]);
      const statsData = statsRes.data.data;
      setStats(statsData);
      setUpcomingInterviews(statsData.upcomingInterviews || []);
      setProbationReviewList(statsData.probationReviewList || []);
      setRecentApplicants(applicantsRes.data.data.applicants || []);
    } catch (err) {
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading && Object.keys(stats).length === 0) {
    return (
        <div className="flex w-full h-full min-h-[500px] items-center justify-center">
            <div className="flex flex-col items-center gap-5">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin"></div>
                    <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500 animate-pulse" size={24} />
                </div>
                <p className="text-slate-600 text-sm font-semibold animate-pulse">Loading your dashboard...</p>
            </div>
        </div>
    );
  }
 
  return (
    <div className="space-y-8 pb-12">
        {/* Enhanced Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Welcome back, <span className="bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">{currentUser.firstName}</span>!</h1>
            </div>
            <div>
                <Button to="/admin/bookings/new" variant="primary" icon={<Users size={16} strokeWidth={2.5} />}>Schedule Interview</Button>
            </div>
        </div>
      
        {error && <div className="mb-4"><Alert type="error" message={error} /></div>}
        
        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard 
                title="Total Applicants" 
                value={stats.totalApplicants ?? '0'} 
                icon={<Users />} 
                linkTo="/admin/hiring/applicants" 
                color="blue" 
                isLoading={loading} 
            />
            <StatCard 
                title="Pending Reviews" 
                value={stats.pendingReviews ?? '0'} 
                icon={<CheckSquare />} 
                linkTo="/admin/hiring/linkedin-review" 
                color="orange" 
                isLoading={loading} 
            />
            <StatCard 
                title="Active Interviewers" 
                value={stats.activeInterviewers ?? '0'} 
                icon={<UserCheck />} 
                linkTo="/admin/interviewers" 
                color="teal" 
                isLoading={loading} 
            />
            <StatCard 
                title="Total Earnings" 
                value={formatCurrency(stats.totalPlatformEarnings || 0)} 
                icon={<DollarSign />} 
                linkTo="/admin/earnings-report" 
                color="purple" 
                isLoading={loading} 
                isSensitive={true} 
            />
        </div>

        {/* Enhanced Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Analytics Section with enhanced styling */}
            <div className="lg:col-span-3">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-7 shadow-md border border-slate-200/60 h-full hover:shadow-xl transition-shadow duration-300">
                    <AnalyticsDashboard />
                </div>
            </div>
            
            {/* Enhanced Probation Review Queue */}
            <div className="lg:col-span-2">
                 <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-slate-200/60 h-full flex flex-col overflow-hidden hover:shadow-xl transition-shadow duration-300">
                    <div className="p-6 border-b border-slate-200/60 bg-gradient-to-br from-orange-50/50 to-amber-50/30">
                        <div className="flex items-center gap-2.5 mb-2">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25">
                                <TrendingUp size={18} strokeWidth={2.5} />
                            </div>
                            <h2 className="text-lg font-black text-slate-900">Probation Review Queue</h2>
                        </div>
                        <p className="text-xs text-slate-600 font-medium">Interviewers with 5+ completed interviews.</p>
                    </div>
                    <div className="flex-1 overflow-hidden flex flex-col bg-white">
                        {loading && probationReviewList.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="w-10 h-10 border-3 border-slate-200 border-t-orange-500 rounded-full animate-spin"></div>
                            </div>
                        ) : probationReviewList.length > 0 ? (
                            <ul className="flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar">
                                {probationReviewList.map(interviewer => (
                                    <ProbationReviewRow key={interviewer._id} interviewer={interviewer} onRefresh={fetchDashboardData} />
                                ))}
                            </ul>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-400">
                                <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                                    <CheckSquare size={32} className="opacity-40" strokeWidth={2} />
                                </div>
                                <p className="text-sm font-bold text-slate-600">All caught up!</p>
                                <p className="text-xs mt-1.5 text-center max-w-[200px]">No interviewers pending review at the moment.</p>
                            </div>
                        )}
                    </div>
                 </div>
            </div>
        </div>

        {/* Enhanced Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Enhanced Recent Applicants */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-slate-200/60 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="p-6 border-b border-slate-200/60 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/25">
                            <Users size={18} strokeWidth={2.5} />
                        </div>
                        <h2 className="text-lg font-black text-slate-900">Recent Applicants</h2>
                    </div>
                    <Link to="/admin/hiring/applicants" className="text-xs font-black text-blue-700 hover:text-blue-800 transition-colors bg-blue-100 hover:bg-blue-200 px-3.5 py-2 rounded-lg shadow-sm">View All</Link>
                </div>
                <div className="p-5 bg-white">
                    <ul className="space-y-3">
                        {loading && recentApplicants.length === 0 ? (
                            <p className="text-center py-8 text-sm text-slate-500 font-medium">Loading...</p>
                        ) : recentApplicants.length > 0 ? (
                            recentApplicants.map(app => <RecentApplicantRow key={app._id} applicant={app} />)
                        ) : (
                            <p className="py-12 text-center text-sm text-slate-500 font-medium">No recent applicants.</p>
                        )}
                    </ul>
                </div>
            </div>

            {/* Enhanced Upcoming Interviews */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-slate-200/60 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="p-6 border-b border-slate-200/60 bg-gradient-to-br from-teal-50/50 to-cyan-50/30 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-md shadow-teal-500/25">
                            <Calendar size={18} strokeWidth={2.5} />
                        </div>
                        <h2 className="text-lg font-black text-slate-900">Upcoming Interviews</h2>
                    </div>
                    <Link to="/admin/main-sheet" className="text-xs font-black text-teal-700 hover:text-teal-800 transition-colors bg-teal-100 hover:bg-teal-200 px-3.5 py-2 rounded-lg shadow-sm">View Sheet</Link>
                </div>
                <div className="p-5 bg-white">
                    <ul className="space-y-3">
                        {loading && upcomingInterviews.length === 0 ? (
                            <p className="text-center py-8 text-sm text-slate-500 font-medium">Loading...</p>
                        ) : upcomingInterviews.length > 0 ? (
                            upcomingInterviews.map(iv => <UpcomingInterviewRow key={iv._id} interview={iv} />)
                        ) : (
                            <p className="py-12 text-center text-sm text-slate-500 font-medium">No upcoming interviews scheduled.</p>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Dashboard;
