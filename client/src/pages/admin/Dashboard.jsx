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

// Premium Light Stat Card
const StatCard = ({ title, value, icon, linkTo, color = "blue", isLoading, isSensitive = false }) => {
    const [isVisible, setIsVisible] = useState(!isSensitive);
    
    // Color mapping for light theme
    const colors = {
        blue: { bg: "bg-blue-50", text: "text-blue-600", icon: "bg-blue-100 text-blue-600" },
        orange: { bg: "bg-orange-50", text: "text-orange-600", icon: "bg-orange-100 text-orange-600" },
        teal: { bg: "bg-teal-50", text: "text-teal-600", icon: "bg-teal-100 text-teal-600" },
        purple: { bg: "bg-purple-50", text: "text-purple-600", icon: "bg-purple-100 text-purple-600" },
    };

    const theme = colors[color] || colors.blue;
  
    const valueDisplay = useMemo(() => {
      if (isLoading) {
        return <div className="h-8 w-24 bg-slate-200 animate-pulse rounded mt-1"></div>;
      }
      if (!isSensitive) {
        return <p className="text-3xl font-black text-slate-800 leading-none tracking-tight">{value}</p>;
      }
      return (
        <div className="flex items-center gap-2">
          <p className="text-3xl font-black text-slate-800 leading-none tracking-tight">
            {isVisible ? value : '••••••••'}
          </p>
          <button
            onClick={() => setIsVisible(!isVisible)}
            className="text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
            title={isVisible ? "Hide value" : "Show value"}
          >
            {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      );
    }, [isLoading, isSensitive, isVisible, value]);
  
    return (
      <div className="group relative bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 h-full flex flex-col overflow-hidden">
        {/* Decorative background blob */}
        <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${theme.bg} opacity-50 group-hover:scale-150 transition-transform duration-500 ease-out`} />
        
        <div className="relative flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">{title}</h3>
            <div className={`p-3 rounded-xl ${theme.icon} transition-colors`}>
                {React.cloneElement(icon, { size: 22 })}
            </div>
        </div>
        
        <div className="relative mt-auto flex items-end justify-between">
            {valueDisplay}
            <Link to={linkTo} className={`flex items-center gap-1 text-xs font-bold ${theme.text} opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0`}>
                View <ArrowRight size={12} />
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
        <li className="flex items-center justify-between gap-4 p-4 rounded-xl bg-white border border-slate-100 hover:border-orange-200 hover:shadow-md hover:shadow-orange-100/50 transition-all duration-200 group">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 text-orange-600 flex items-center justify-center font-bold text-sm border border-orange-200">
                    {interviewer.user.firstName[0]}{interviewer.user.lastName[0]}
                </div>
                <div>
                    <p className="font-bold text-slate-800 text-sm">{`${interviewer.user.firstName} ${interviewer.user.lastName}`}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Activity size={12} className="text-teal-500" />
                        <span className="font-medium text-slate-700">{interviewer.metrics.interviewsCompleted}</span> interviews completed
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={handleSendEmail}
                    disabled={sendingMail || markingSent}
                    className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-all disabled:opacity-50 border border-blue-100"
                    title="Send Probation Completion Email"
                >
                    {sendingMail ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" /> : <Mail size={16} />}
                </button>
                <button
                    onClick={handleMarkAsSent}
                    disabled={sendingMail || markingSent}
                    className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 transition-all disabled:opacity-50 border border-green-100"
                    title="Manually Mark as Sent"
                >
                    {markingSent ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-green-600 border-t-transparent" /> : <Check size={16} />}
                </button>
            </div>
        </li>
    );
};

const RecentApplicantRow = ({ applicant }) => (
    <li className="p-4 flex items-center justify-between gap-4 rounded-xl bg-white border border-slate-100 hover:border-blue-200 hover:shadow-md hover:shadow-blue-50 transition-all duration-200">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm border border-slate-200">
                {applicant.fullName[0]}
            </div>
            <div>
                <p className="font-bold text-slate-800 text-sm">{applicant.fullName}</p>
                <p className="text-xs text-slate-500">{applicant.email}</p>
            </div>
        </div>
        <StatusBadge status={applicant.status} />
    </li>
);

const UpcomingInterviewRow = ({ interview }) => (
    <li className="p-4 rounded-xl bg-white border border-slate-100 hover:border-teal-200 hover:shadow-md hover:shadow-teal-50 transition-all duration-200 grid grid-cols-3 gap-4 items-center">
        <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                <Calendar size={18} />
            </div>
            <div>
                <p className="font-bold text-slate-800 text-sm">{interview.candidateName}</p>
                <p className="text-xs text-slate-500">Candidate</p>
            </div>
        </div>
        <div>
            <p className="font-medium text-slate-700 text-sm">{formatDate(interview.interviewDate)}</p>
            <p className="text-xs text-slate-500">{`${formatTime(interview.interviewTime.split('-')[0].trim())}`}</p>
        </div>
        {interview.meetingLink ? (
            <a 
                href={interview.meetingLink} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-100 transition-colors justify-self-end border border-blue-100"
            >
                Join Meeting
            </a>
        ) : (
            <span className="text-xs text-slate-400 italic justify-self-end px-3 py-1.5">No link</span>
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
        <div className="flex w-full h-full min-h-[400px] items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-orange-500 rounded-full animate-spin"></div>
                <p className="text-slate-500 text-sm animate-pulse">Loading dashboard...</p>
            </div>
        </div>
    );
  }
 
  return (
    <div className="space-y-8 pb-10">
        {/* Header Section */}
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Welcome back, {currentUser.firstName}!</h1>
            </div>
            <div>
                <Button to="/admin/bookings/new" variant="primary" icon={<Users size={16} />}>New Interview</Button>
            </div>
        </div>
      
        {error && <div className="mb-4"><Alert type="error" message={error} /></div>}
        
        {/* Stats Grid */}
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

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Analytics Section */}
            <div className="lg:col-span-3">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-full">
                    <AnalyticsDashboard />
                </div>
            </div>
            
            {/* Probation Review Queue */}
            <div className="lg:col-span-2">
                 <div className="bg-white rounded-2xl shadow-sm border border-slate-100 h-full flex flex-col overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <TrendingUp size={20} className="text-orange-500" />
                            Probation Review Queue
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">Interviewers with 5+ completed interviews.</p>
                    </div>
                    <div className="flex-1 overflow-hidden flex flex-col bg-white">
                        {loading && probationReviewList.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="w-8 h-8 border-2 border-slate-200 border-t-orange-500 rounded-full animate-spin"></div>
                            </div>
                        ) : probationReviewList.length > 0 ? (
                            <ul className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                                {probationReviewList.map(interviewer => (
                                    <ProbationReviewRow key={interviewer._id} interviewer={interviewer} onRefresh={fetchDashboardData} />
                                ))}
                            </ul>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-400">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                                    <CheckSquare size={32} className="opacity-20" />
                                </div>
                                <p className="text-sm font-medium">All caught up!</p>
                                <p className="text-xs mt-1">No interviewers pending review.</p>
                            </div>
                        )}
                    </div>
                 </div>
            </div>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Applicants */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Users size={20} className="text-blue-500" />
                        Recent Applicants
                    </h2>
                    <Link to="/admin/hiring/applicants" className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors bg-blue-50 px-3 py-1 rounded-lg">View All</Link>
                </div>
                <div className="p-4 bg-white">
                    <ul className="space-y-3">
                        {loading && recentApplicants.length === 0 ? (
                            <p className="text-center p-4 text-sm text-slate-500">Loading...</p>
                        ) : recentApplicants.length > 0 ? (
                            recentApplicants.map(app => <RecentApplicantRow key={app._id} applicant={app} />)
                        ) : (
                            <p className="p-8 text-center text-sm text-slate-500">No recent applicants.</p>
                        )}
                    </ul>
                </div>
            </div>

            {/* Upcoming Interviews */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Calendar size={20} className="text-teal-500" />
                        Upcoming Interviews
                    </h2>
                    <Link to="/admin/main-sheet" className="text-sm font-bold text-teal-600 hover:text-teal-700 transition-colors bg-teal-50 px-3 py-1 rounded-lg">View Sheet</Link>
                </div>
                <div className="p-4 bg-white">
                    <ul className="space-y-3">
                        {loading && upcomingInterviews.length === 0 ? (
                            <p className="text-center p-4 text-sm text-slate-500">Loading...</p>
                        ) : upcomingInterviews.length > 0 ? (
                            upcomingInterviews.map(iv => <UpcomingInterviewRow key={iv._id} interview={iv} />)
                        ) : (
                            <p className="p-8 text-center text-sm text-slate-500">No upcoming interviews scheduled.</p>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Dashboard;
