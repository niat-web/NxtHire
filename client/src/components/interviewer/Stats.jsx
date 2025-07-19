// client/src/components/interviewer/Stats.jsx
import React from 'react';
import { FiCheck, FiStar, FiCalendar, FiDollarSign } from 'react-icons/fi';
import DashboardStat from '../common/DashboardStat';
import ProgressBar from '../common/ProgressBar';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

const Stats = ({ metrics = {}, status = '', paymentTier = '', profileCompleteness = 0 }) => {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardStat
          title="Interviews Completed"
          value={(metrics.interviewsCompleted || 0).toString()}
          icon={<FiCheck className="h-6 w-6 text-primary-600" />}
        />
        
        <DashboardStat
          title="Average Rating"
          value={((metrics.averageRating || 0).toFixed(1)) + ' / 5.0'}
          icon={<FiStar className="h-6 w-6 text-primary-600" />}
        />
        
        <DashboardStat
          title="Completion Rate"
          value={formatPercentage(metrics.completionRate || 0)}
          icon={<FiCalendar className="h-6 w-6 text-primary-600" />}
        />
        
        <DashboardStat
          title="Total Earnings"
          value={formatCurrency(metrics.totalEarnings || 0)}
          icon={<FiDollarSign className="h-6 w-6 text-primary-600" />}
        />
      </div>
      
      {/* Progress Bars */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-gray-700">Profile Completeness</h3>
              <span className="text-sm font-medium text-gray-500">
                {profileCompleteness || 0}%
              </span>
            </div>
            <ProgressBar 
              value={profileCompleteness || 0} 
              variant={profileCompleteness < 100 ? 'warning' : 'success'}
            />
            {profileCompleteness < 100 && (
              <p className="mt-2 text-sm text-gray-500">
                Complete your profile to start receiving interview assignments.
              </p>
            )}
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-gray-700">Account Status</h3>
              <span className={`text-sm font-medium ${
                status === 'Active' ? 'text-green-600' : 
                status === 'On Probation' ? 'text-yellow-600' : 'text-gray-500'
              }`}>
                {status}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              {status === 'On Probation'
                ? 'Complete at least 5 interviews with an average rating of 3.5 or above to become an active interviewer.'
                : status === 'Active'
                ? 'Your account is active. You can receive interview assignments based on your availability.'
                : 'Your account is inactive. Please contact support for assistance.'}
            </p>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-gray-700">Payment Tier</h3>
              <span className="text-sm font-medium text-primary-600">
                {paymentTier || 'Tier 1'}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              {paymentTier === 'Tier 1'
                ? 'Complete 20 interviews with an average rating of 4.0 or above to advance to Tier 2.'
                : paymentTier === 'Tier 2'
                ? 'Complete 50 interviews with an average rating of 4.5 or above to advance to Tier 3.'
                : 'You have reached the highest payment tier. Congratulations!'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;