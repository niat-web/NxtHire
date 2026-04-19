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
    primary: 'bg-slate-900',
    secondary: 'bg-slate-600',
    success: 'bg-emerald-600',
    warning: 'bg-amber-500',
    danger: 'bg-red-600',
    info: 'bg-slate-700',
    gray: 'bg-slate-400'
  };

  const barColorClass = variantClasses[variant] || variantClasses.primary;

  return (
    <div className={cn('w-full', className)}>
      {showValue && valuePosition === 'top' && (
        <div className="flex justify-end mb-1">
          <span className="text-[12px] font-semibold text-slate-700">{value}%</span>
        </div>
      )}

      <div className={cn('w-full bg-slate-100 rounded-full', height)}>
        <div
          className={cn(barColorClass, height, 'rounded-full transition-all duration-300 ease-in-out')}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {showValue && valuePosition === 'right' && (
        <div className="flex justify-end mt-1">
          <span className="text-[12px] font-semibold text-slate-700">{value}%</span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
