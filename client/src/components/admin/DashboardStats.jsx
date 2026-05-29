import React from 'react';
import { Users, CheckSquare, UserCheck } from 'lucide-react';
import DashboardStat from '../common/DashboardStat';

const DashboardStats = ({ stats = {} }) => {
  const {
    totalApplicants = 0,
    pendingReviews = 0,
    activeInterviewers = 0,
    weeklyChange = null
  } = stats;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <DashboardStat
        title="Total Applicants"
        value={totalApplicants.toString()}
        icon={<Users className="h-4 w-4" />}
      />

      <DashboardStat
        title="Pending Reviews"
        value={pendingReviews.toString()}
        icon={<CheckSquare className="h-4 w-4" />}
        change={weeklyChange?.pendingReviews}
        changeType={weeklyChange?.pendingReviews > 0 ? 'increase' : 'decrease'}
        changeText="from last week"
      />

      <DashboardStat
        title="Active Interviewers"
        value={activeInterviewers.toString()}
        icon={<UserCheck className="h-4 w-4" />}
      />
    </div>
  );
};

export default DashboardStats;
