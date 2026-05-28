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
    return changeType === 'increase' ? 'text-emerald-600' : 'text-destructive';
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
    <Card className={cn('h-full border-border shadow-brave-card', className)}>
      <CardContent className="p-5 pt-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{title}</p>
            {isLoading ? (
              <Skeleton className="h-9 w-28 mt-2" />
            ) : (
              <p className="font-display mt-2 text-[30px] font-bold text-foreground tracking-tight leading-none tabular-nums">{value}</p>
            )}
          </div>
          {icon && (
            <div className="h-10 w-10 inline-flex items-center justify-center rounded-md bg-primary/10 text-primary">
              {icon}
            </div>
          )}
        </div>

        {(change !== undefined || changeText) && (
          <div className="mt-4">
            <div className={cn('flex items-center text-[12.5px]', getChangeColor())}>
              {getChangeIcon()}
              <span className="font-semibold ml-1">
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
