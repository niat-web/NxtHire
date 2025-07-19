// client/src/components/common/ProgressBar.jsx
import React from 'react';

const ProgressBar = ({ 
  value = 0, 
  min = 0, 
  max = 100, 
  variant = 'primary',
  height = 'h-2',
  showValue = false,
  valuePosition = 'right',
  className = ''
}) => {
  // Ensure value is within range
  const normalizedValue = Math.max(min, Math.min(value, max));
  
  // Calculate percentage
  const percentage = ((normalizedValue - min) / (max - min)) * 100;
  
  // Variant classes
  const variantClasses = {
    primary: 'bg-primary-600',
    secondary: 'bg-secondary-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-500',
    danger: 'bg-red-600',
    info: 'bg-blue-500',
    gray: 'bg-gray-500'
  };
  
  const barColorClass = variantClasses[variant] || variantClasses.primary;
  
  return (
    <div className={`w-full ${className}`}>
      {showValue && valuePosition === 'top' && (
        <div className="flex justify-end mb-1">
          <span className="text-sm font-medium text-gray-700">{value}%</span>
        </div>
      )}
      
      <div className={`w-full bg-gray-200 rounded-full ${height}`}>
        <div 
          className={`${barColorClass} ${height} rounded-full transition-all duration-300 ease-in-out`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      
      {showValue && valuePosition === 'right' && (
        <div className="flex justify-end mt-1">
          <span className="text-sm font-medium text-gray-700">{value}%</span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;