// client/src/components/common/EmptyState.jsx
import React from 'react';
import { Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from './Button';

const EmptyState = ({
  title = 'No data available',
  description = 'There are no items to display at this moment.',
  icon = <Inbox className="h-12 w-12" />,
  actionText,
  actionUrl,
  onActionClick,
  className = ''
}) => {
  return (
    <div className={cn('text-center py-12 px-4', className)}>
      <div className="flex justify-center mb-4 text-muted-foreground">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md mx-auto">{description}</p>

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
