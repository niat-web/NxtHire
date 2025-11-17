// // client/src/pages/admin/Dashboard.jsx
// import React, { useEffect, useState, useMemo, useCallback } from 'react';
// import { Link } from 'react-router-dom';
// import { FiUsers, FiCheckSquare, FiUserCheck, FiDollarSign, FiChevronRight, FiEye, FiEyeOff } from 'react-icons/fi';
// import Table from '../../components/common/Table';
// import Loader from '../../components/common/Loader'; 
// import StatusBadge from '../../components/common/StatusBadge';
// import { getApplicants, getDashboardStats } from '../../api/admin.api';
// import { formatCurrency, formatDate, formatTime } from '../../utils/formatters';
// import Alert from '../../components/common/Alert';
// import { useAuth } from '../../hooks/useAuth';
// import AnalyticsDashboard from '../../components/admin/AnalyticsDashboard'; 
// import Badge from '../../components/common/Badge';

// // A more compact Stat Card component, now with support for sensitive data
// const StatCard = ({ title, value, icon, linkTo, color = 'text-primary-600', isLoading, isSensitive = false }) => {
//   // State to manage visibility for sensitive cards
//   const [isVisible, setIsVisible] = useState(!isSensitive);

//   const valueDisplay = useMemo(() => {
//     if (isLoading) {
//       return <div className="h-8 w-24 bg-gray-200 animate-pulse rounded mt-1"></div>;
//     }
    
//     // Non-sensitive card just displays the value
//     if (!isSensitive) {
//       return <p className="text-3xl font-bold text-gray-800 leading-none">{value}</p>;
//     }
    
//     // Sensitive card displays value/placeholder with a toggle button
//     return (
//       <div className="flex items-center gap-2">
//         <p className="text-3xl font-bold text-gray-800 leading-none">
//           {isVisible ? value : '₹xx,xx,xxx'}
//         </p>
//         <button
//           onClick={() => setIsVisible(!isVisible)}
//           className="text-gray-400 hover:text-gray-600 focus:outline-none"
//           title={isVisible ? "Hide earnings" : "Show earnings"}
//         >
//           {isVisible ? <FiEyeOff size={16} /> : <FiEye size={16} />}
//         </button>
//       </div>
//     );
//   }, [isLoading, isSensitive, isVisible, value]);

//   return (
//     <div className="bg-white border border-gray-200 rounded-lg shadow-sm h-full flex flex-col">
//       <div className={`p-2 border-b border-gray-200 flex justify-between items-center bg-gray-50/50`}>
//         <h3 className={`text-xs font-bold uppercase tracking-wider ${color}`}>{title}</h3>
//         <div className={`${color}`}>
//           {React.cloneElement(icon, { size: 16 })}
//         </div>
//       </div>
//       <div className="p-3 flex-grow flex flex-row items-end justify-between">
//         {valueDisplay}
//         <Link to={linkTo} className="text-xs font-medium text-gray-400 hover:text-primary-600 flex items-center group">
//           Details
//           <FiChevronRight className="ml-0.5 h-3 w-3" />
//         </Link>
//       </div>
//     </div>
//   );
// };


// const Dashboard = () => {
//   const [stats, setStats] = useState({});
//   const [recentApplicants, setRecentApplicants] = useState([]);
//   const [upcomingInterviews, setUpcomingInterviews] = useState([]);
//   const [probationReviewList, setProbationReviewList] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const { currentUser } = useAuth();
  
//   const fetchDashboardData = useCallback(async () => {
//     try {
//       setLoading(true);
//       setError('');
      
//       const [statsRes, applicantsRes] = await Promise.all([
//         getDashboardStats(),
//         getApplicants({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' })
//       ]);
      
//       const statsData = statsRes.data.data;
//       setStats(statsData);
//       setUpcomingInterviews(statsData.upcomingInterviews || []);
//       setProbationReviewList(statsData.probationReviewList || []);
//       setRecentApplicants(applicantsRes.data.data.applicants || []);

//     } catch (err) {
//       setError('Failed to load dashboard data. Please try again.');
//       setRecentApplicants([]);
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchDashboardData();
//   }, [fetchDashboardData]);
  
//   const applicantColumns = useMemo(() => [
//     { 
//         key: 'name', title: 'Applicant Name', 
//         render: (row) => (
//             <Link to={`/admin/hiring/applicants?search=${row.fullName}`} className="font-medium text-gray-800 hover:text-primary-600 hover:underline">
//                 {row.fullName}
//             </Link>
//         )
//     },
//     { 
//         key: 'email', title: 'Email', 
//         render: (row) => <div className="text-gray-500">{row.email}</div> 
//     },
//     { 
//         key: 'status', title: 'Status', 
//         render: (row) => <StatusBadge status={row.status} /> 
//     },
//     { 
//         key: 'applied', title: 'Applied On', 
//         render: (row) => <div className="text-gray-500">{formatDate(row.createdAt)}</div> 
//     }
//   ], []);

//   const upcomingInterviewsColumns = useMemo(() => [
//     { 
//         key: 'candidateName', title: 'Candidate', 
//         render: (row) => <div className="font-medium text-gray-800">{row.candidateName}</div> 
//     },
//     { 
//         key: 'interviewDate', title: 'Date', 
//         render: (row) => <div className="text-gray-500">{formatDate(row.interviewDate)}</div> 
//     },
//     { 
//         key: 'slotTime', title: 'Slot', 
//         render: (row) => {
//             if (!row.interviewTime || !row.interviewTime.includes('-')) {
//                 return <div className="text-gray-600">{row.interviewTime || 'N/A'}</div>;
//             }
//             const [startTime, endTime] = row.interviewTime.split('-').map(time => time.trim());
//             return <div className="text-gray-600">{`${formatTime(startTime)} - ${formatTime(endTime)}`}</div>;
//         } 
//     },
//     { 
//         key: 'meetLink', title: 'Meet Link', 
//         render: (row) => (
//             row.meetingLink 
//                 ? <a href={row.meetingLink} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 hover:underline">Join</a> 
//                 : <span className="text-gray-400">N/A</span>
//         ) 
//     }
//   ], []);
 
//   const probationReviewColumns = useMemo(() => [
//     { 
//         key: 'name', title: 'Interviewer Name', 
//         render: (row) => `${row.user.firstName} ${row.user.lastName}`
//     },
//     { 
//         key: 'interviews', title: 'Interviews Count', 
//         render: (row) => <div className="text-center">{row.metrics.interviewsCompleted}</div> 
//     },
//     { 
//         key: 'status', title: 'Status', 
//         render: (row) => <StatusBadge status={row.status} /> 
//     },
//     { 
//         key: 'mailStatus', title: 'Probation Mail Status', 
//         render: (row) => row.probationEmailSentAt 
//             ? <Badge variant="success">Sent</Badge> 
//             : <Badge variant="warning">Pending</Badge> 
//     }
//   ], []);

//   return (
//     <div className="space-y-8">

//       {error && <div className="mb-4"><Alert type="error" message={error} /></div>}
      
//       <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
//         <StatCard title="Total Applicants" value={stats.totalApplicants || 0} icon={<FiUsers />} linkTo="/admin/hiring/applicants" color="text-blue-600" isLoading={loading} />
//         <StatCard title="Pending Reviews" value={stats.pendingReviews || 0} icon={<FiCheckSquare />} linkTo="/admin/hiring/linkedin-review" color="text-orange-600" isLoading={loading} />
//         <StatCard title="Active Interviewers" value={stats.activeInterviewers || 0} icon={<FiUserCheck />} linkTo="/admin/interviewers" color="text-green-600" isLoading={loading} />
//         <StatCard 
//           title="Total" 
//           value={formatCurrency(stats.totalPlatformEarnings || 0)} 
//           icon={<FiDollarSign />} 
//           linkTo="/admin/earnings-report" 
//           color="text-slate-600" 
//           isLoading={loading} 
//           isSensitive={true} 
//         />
//       </div>

//       <div>
//         <AnalyticsDashboard />
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//         {/* Left Column: Recent Applicants */}
//         <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
//             <div className="p-4 bg-gray-50/75 border-b border-gray-200 flex items-center justify-between">
//                 <h2 className="text-lg font-bold text-gray-800">Recent Applicants</h2>
//                 <Link to="/admin/hiring/applicants" className="text-sm font-medium text-blue-600 hover:underline">
//                     View All
//                 </Link>
//             </div>
//             <div className="overflow-x-auto">
//               <Table 
//                   columns={applicantColumns} 
//                   data={recentApplicants} 
//                   isLoading={loading} 
//                   emptyMessage="No recent applicants."
//               />
//             </div>
//         </div>

//         {/* Right Column: Upcoming Interviews */}
//         <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
//             <div className="p-4 bg-gray-50/75 border-b border-gray-200 flex items-center justify-between">
//                 <h2 className="text-lg font-bold text-gray-800">Upcoming Interviews</h2>
//                 <Link to="/admin/main-sheet" className="text-sm font-medium text-blue-600 hover:underline">
//                     View Sheet
//                 </Link>
//             </div>
//             <div className="overflow-x-auto">
//               <Table 
//                   columns={upcomingInterviewsColumns} 
//                   data={upcomingInterviews} 
//                   isLoading={loading} 
//                   emptyMessage="No upcoming interviews scheduled."
//               />
//             </div>
//           </div>
//       </div>
      
//       {probationReviewList.length > 0 && (
//           <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
//               <div className="p-4 bg-gray-50/75 border-b border-gray-200 flex items-center justify-between">
//                   <h2 className="text-lg font-bold text-gray-800">Review of completion 5 interviews on probation</h2>
//                   <Link to="/admin/interviewers" className="text-sm font-medium text-blue-600 hover:underline">
//                       View All Interviewers
//                   </Link>
//               </div>
//               <div className="overflow-x-auto">
//                 <Table 
//                     columns={probationReviewColumns} 
//                     data={probationReviewList} 
//                     isLoading={loading}
//                 />
//               </div>
//           </div>
//       )}
//     </div>
//   );
// };

// export default Dashboard;



import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Users, CheckSquare, UserCheck, DollarSign, Eye, EyeOff, Mail, Check } from 'lucide-react';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import { getApplicants, getDashboardStats, sendProbationEmail, markProbationAsSent } from '../../api/admin.api';
import { useAlert } from '../../hooks/useAlert';
import { formatCurrency, formatDate, formatTime } from '../../utils/formatters';
import Alert from '../../components/common/Alert';
import { useAuth } from '../../hooks/useAuth';
import AnalyticsDashboard from '../../components/admin/AnalyticsDashboard'; 

// A more compact Stat Card component, now with support for sensitive data
const StatCard = ({ title, value, icon, linkTo, color = 'text-primary-600', isLoading, isSensitive = false }) => {
    const [isVisible, setIsVisible] = useState(!isSensitive);
  
    const valueDisplay = useMemo(() => {
      if (isLoading) {
        return <div className="h-8 w-24 bg-slate-200 animate-pulse rounded mt-1"></div>;
      }
      if (!isSensitive) {
        return <p className="text-3xl font-bold text-slate-800 leading-none">{value}</p>;
      }
      return (
        <div className="flex items-center gap-2">
          <p className="text-3xl font-bold text-slate-800 leading-none">
            {isVisible ? value : '••••••••'}
          </p>
          <button
            onClick={() => setIsVisible(!isVisible)}
            className="text-slate-400 hover:text-slate-600 focus:outline-none"
            title={isVisible ? "Hide value" : "Show value"}
          >
            {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      );
    }, [isLoading, isSensitive, isVisible, value]);
  
    return (
      <div className="bg-white border border-slate-200/60 rounded-xl shadow-sm h-full flex flex-col p-5 hover:border-slate-300 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">{title}</h3>
              <div className={`p-2 rounded-lg ${color}`}>{React.cloneElement(icon, { size: 20, className: 'text-white' })}</div>
          </div>
          <div className="mt-2 flex-grow flex items-end justify-between">
              {valueDisplay}
              <Link to={linkTo} className="text-xs font-semibold text-blue-600 hover:underline">View</Link>
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
        <li className="flex items-center justify-between gap-4 p-3 rounded-lg hover:bg-slate-50">
            <div>
                <p className="font-semibold text-slate-800 text-sm">{`${interviewer.user.firstName} ${interviewer.user.lastName}`}</p>
                <p className="text-xs text-slate-500">{interviewer.metrics.interviewsCompleted} interviews completed</p>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={handleSendEmail}
                    disabled={sendingMail || markingSent}
                    className="p-1.5 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors disabled:opacity-50"
                    title="Send Probation Completion Email"
                >
                    {sendingMail ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500/50 border-t-blue-600" /> : <Mail size={14} />}
                </button>
                <button
                    onClick={handleMarkAsSent}
                    disabled={sendingMail || markingSent}
                    className="p-1.5 rounded-md bg-green-100 text-green-700 hover:bg-green-200 transition-colors disabled:opacity-50"
                    title="Manually Mark as Sent"
                >
                    {markingSent ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-green-500/50 border-t-green-600" /> : <Check size={14} />}
                </button>
            </div>
        </li>
    );
};

const RecentApplicantRow = ({ applicant }) => (
    <li className="p-3 flex items-center justify-between gap-4 rounded-lg hover:bg-slate-50">
        <div className="flex items-center gap-3">
            <div>
                <p className="font-semibold text-slate-800 text-sm">{applicant.fullName}</p>
                <p className="text-xs text-slate-500">{applicant.email}</p>
            </div>
        </div>
        <StatusBadge status={applicant.status} />
    </li>
);

const UpcomingInterviewRow = ({ interview }) => (
    <li className="p-3 rounded-lg hover:bg-slate-50 grid grid-cols-3 gap-4 items-center">
        <div>
            <p className="font-semibold text-slate-800 text-sm">{interview.candidateName}</p>
            <p className="text-xs text-slate-500">Candidate</p>
        </div>
        <div>
            <p className="font-medium text-slate-700 text-sm">{formatDate(interview.interviewDate)}</p>
            <p className="text-xs text-slate-500">{`${formatTime(interview.interviewTime.split('-')[0].trim())}`}</p>
        </div>
        {interview.meetingLink ? (
            <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-blue-600 hover:underline justify-self-end">Join</a>
        ) : (
            <span className="text-xs text-slate-400 italic justify-self-end">No link</span>
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
    return <div className="flex w-full h-full items-center justify-center p-20"><div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div></div>;
  }
 
  return (
    <div className="space-y-8">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Welcome back, {currentUser.firstName}!</h1>
            </div>
            <div>
                <Button to="/admin/bookings/new" variant="primary" icon={<Users size={16} />}>New Interview</Button>
            </div>
        </div>
      
        {error && <div className="mb-4"><Alert type="error" message={error} /></div>}
        
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total Applicants" value={stats.totalApplicants ?? '0'} icon={<Users />} linkTo="/admin/hiring/applicants" color="bg-blue-500" isLoading={loading} />
            <StatCard title="Pending Reviews" value={stats.pendingReviews ?? '0'} icon={<CheckSquare />} linkTo="/admin/hiring/linkedin-review" color="bg-orange-500" isLoading={loading} />
            <StatCard title="Active Interviewers" value={stats.activeInterviewers ?? '0'} icon={<UserCheck />} linkTo="/admin/interviewers" color="bg-green-500" isLoading={loading} />
            <StatCard title="Total Earnings" value={formatCurrency(stats.totalPlatformEarnings || 0)} icon={<DollarSign />} linkTo="/admin/earnings-report" color="bg-slate-500" isLoading={loading} isSensitive={true} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
                <AnalyticsDashboard />
            </div>
            <div className="lg:col-span-2">
                 <div className="bg-white border border-slate-200/60 rounded-xl shadow-sm h-full flex flex-col">
                    <div className="p-4 border-b border-slate-200">
                        <h2 className="font-bold text-slate-800">Probation Review Queue</h2>
                        <p className="text-xs text-slate-500">Interviewers with 5+ completed interviews.</p>
                    </div>
                    {loading && probationReviewList.length === 0 ? <p className="text-center p-4 text-sm text-slate-500">Loading...</p> :
                     probationReviewList.length > 0 ? (
                        <ul className="flex-1 divide-y divide-slate-200/60 p-2 overflow-y-auto">
                            {probationReviewList.map(interviewer => (
                                <ProbationReviewRow key={interviewer._id} interviewer={interviewer} onRefresh={fetchDashboardData} />
                            ))}
                        </ul>
                     ) : <p className="p-8 text-center text-sm text-slate-500">No interviewers are pending probation review.</p>
                    }
                 </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white border border-slate-200/60 rounded-xl shadow-sm">
                <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                    <h2 className="font-bold text-slate-800">Recent Applicants</h2>
                    <Link to="/admin/hiring/applicants" className="text-sm font-semibold text-blue-600 hover:underline">View All</Link>
                </div>
                <ul className="divide-y divide-slate-200/60 p-2">
                    {loading && recentApplicants.length === 0 ? <p className="p-4 text-center text-sm text-slate-500">Loading...</p> : 
                    recentApplicants.length > 0 ? recentApplicants.map(app => <RecentApplicantRow key={app._id} applicant={app} />) : <p className="p-8 text-center text-sm text-slate-500">No recent applicants.</p> }
                </ul>
            </div>

            <div className="bg-white border border-slate-200/60 rounded-xl shadow-sm">
                <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                    <h2 className="font-bold text-slate-800">Upcoming Interviews</h2>
                    <Link to="/admin/main-sheet" className="text-sm font-semibold text-blue-600 hover:underline">View Sheet</Link>
                </div>
                <ul className="divide-y divide-slate-200/60 p-2">
                    {loading && upcomingInterviews.length === 0 ? <p className="p-4 text-center text-sm text-slate-500">Loading...</p> :
                    upcomingInterviews.length > 0 ? upcomingInterviews.map(iv => <UpcomingInterviewRow key={iv._id} interview={iv} />) : <p className="p-8 text-center text-sm text-slate-500">No upcoming interviews scheduled.</p> }
                </ul>
            </div>
        </div>
    </div>
  );
};

export default Dashboard;
