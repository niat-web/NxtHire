// client/src/components/common/DashboardStat.jsx
import React from 'react';
import { FiArrowUp, FiArrowDown } from 'react-icons/fi';
import Card from './Card';

const DashboardStat = ({
  title,
  value,
  icon,
  change,
  changeType = 'increase', // 'increase' or 'decrease'
  changeText,
  isLoading = false,
  className = ''
}) => {
  const getChangeColor = () => {
    if (changeType === 'neutral') return 'text-gray-500';
    return changeType === 'increase' ? 'text-green-500' : 'text-red-500';
  };

  const getChangeIcon = () => {
    if (changeType === 'neutral') return null;
    return changeType === 'increase' ? (
      <FiArrowUp className="h-3 w-3" />
    ) : (
      <FiArrowDown className="h-3 w-3" />
    );
  };

  return (
    <Card className={`h-full ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          {isLoading ? (
            <div className="h-8 w-24 bg-gray-200 animate-pulse rounded mt-1"></div>
          ) : (
            <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
          )}
        </div>
        {icon && (
          <div className="p-3 bg-primary-50 rounded-full">
            {icon}
          </div>
        )}
      </div>
      
      {(change !== undefined || changeText) && (
        <div className="mt-4">
          <div className={`flex items-center text-sm ${getChangeColor()}`}>
            {getChangeIcon()}
            <span className="font-medium ml-1">
              {change !== undefined && `${Math.abs(change)}%`}
              {changeText && (change !== undefined ? ' ' : '')}{changeText}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
};

export default DashboardStat;