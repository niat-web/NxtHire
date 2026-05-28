import React from 'react';
import { Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from './Button';

const EmptyState = ({
  title = 'No data available',
  description = 'There are no items to display at this moment.',
  icon = <Inbox className="h-10 w-10" />,
  actionText,
  actionUrl,
  onActionClick,
  className = ''
}) => {
  return (
    <div className={cn('text-center py-14 px-6', className)}>
      <div className="flex justify-center mb-5 text-slate-300">
        {icon}
      </div>
      <h3 className="text-[18px] font-semibold text-slate-900 mb-1.5 tracking-tight" style={{ fontFamily: 'Supreme, "Plus Jakarta Sans", system-ui, sans-serif' }}>{title}</h3>
      <p className="text-[13.5px] text-slate-500 max-w-md mx-auto leading-relaxed">{description}</p>

      {(actionText && (actionUrl || onActionClick)) && (
        <div className="mt-6">
          <Button
            variant="primary"
            size="md"
            to={actionUrl}
            onClick={onActionClick}
          >
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
