// client/src/components/common/DashboardStat.jsx
import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const DashboardStat = ({
  title,
  value,
  icon,
  change,
  changeType = 'increase',
  changeText,
  isLoading = false,
  className = ''
}) => {
  const getChangeColor = () => {
    if (changeType === 'neutral') return 'text-muted-foreground';
    return changeType === 'increase' ? 'text-emerald-600' : 'text-red-600';
  };

  const getChangeIcon = () => {
    if (changeType === 'neutral') return null;
    return changeType === 'increase' ? (
      <ArrowUp className="h-3 w-3" />
    ) : (
      <ArrowDown className="h-3 w-3" />
    );
  };

  return (
    <Card className={cn('h-full', className)}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {isLoading ? (
              <Skeleton className="h-8 w-24 mt-1" />
            ) : (
              <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
            )}
          </div>
          {icon && (
            <div className="p-3 bg-primary/10 rounded-full">
              {icon}
            </div>
          )}
        </div>

        {(change !== undefined || changeText) && (
          <div className="mt-4">
            <div className={cn('flex items-center text-sm', getChangeColor())}>
              {getChangeIcon()}
              <span className="font-medium ml-1">
                {change !== undefined && `${Math.abs(change)}%`}
                {changeText && (change !== undefined ? ' ' : '')}{changeText}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardStat;
