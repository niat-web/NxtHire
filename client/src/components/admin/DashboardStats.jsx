// client/src/components/admin/DashboardStats.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiCheckSquare, FiUserCheck, FiBarChart2, FiExternalLink } from 'react-icons/fi';
import DashboardStat from '../common/DashboardStat';

const DashboardStats = ({ stats = {} }) => {
  const {
    totalApplicants = 0,
    pendingReviews = 0,
    activeInterviewers = 0,
    weeklyChange = null
  } = stats;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <DashboardStat
        title="Total Applicants"
        value={totalApplicants.toString()}
        icon={<FiUsers className="h-6 w-6 text-primary-600" />}
      />
      
      <DashboardStat
        title="Pending Reviews"
        value={pendingReviews.toString()}
        icon={<FiCheckSquare className="h-6 w-6 text-primary-600" />}
        change={weeklyChange?.pendingReviews}
        changeType={weeklyChange?.pendingReviews > 0 ? 'increase' : 'decrease'}
        changeText="from last week"
      />
      
      <DashboardStat
        title="Active Interviewers"
        value={activeInterviewers.toString()}
        icon={<FiUserCheck className="h-6 w-6 text-primary-600" />}
      />
    </div>
  );
};

export default DashboardStats;