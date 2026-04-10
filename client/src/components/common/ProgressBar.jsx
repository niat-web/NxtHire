// client/src/components/common/ProgressBar.jsx
import React from 'react';
import { cn } from '@/lib/utils';

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
  const normalizedValue = Math.max(min, Math.min(value, max));
  const percentage = ((normalizedValue - min) / (max - min)) * 100;

  const variantClasses = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    success: 'bg-emerald-600',
    warning: 'bg-amber-500',
    danger: 'bg-red-600',
    info: 'bg-sky-500',
    gray: 'bg-gray-500'
  };

  const barColorClass = variantClasses[variant] || variantClasses.primary;

  return (
    <div className={cn('w-full', className)}>
      {showValue && valuePosition === 'top' && (
        <div className="flex justify-end mb-1">
          <span className="text-sm font-medium text-foreground">{value}%</span>
        </div>
      )}

      <div className={cn('w-full bg-muted rounded-full', height)}>
        <div
          className={cn(barColorClass, height, 'rounded-full transition-all duration-300 ease-in-out')}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {showValue && valuePosition === 'right' && (
        <div className="flex justify-end mt-1">
          <span className="text-sm font-medium text-foreground">{value}%</span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
