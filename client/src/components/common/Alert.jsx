// client/src/components/common/Alert.jsx
import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const Alert = ({
  type = 'info',
  title,
  message,
  onClose,
  className = '',
  showIcon = true,
  dismissible = false,
}) => {
  const typeConfig = {
    info: {
      containerClass: 'bg-sky-50 border-sky-400 text-sky-800',
      icon: <Info className="h-5 w-5 text-sky-500" />,
      dismissClass: 'text-sky-500 hover:bg-sky-100 focus:ring-sky-500',
    },
    success: {
      containerClass: 'bg-emerald-50 border-emerald-400 text-emerald-800',
      icon: <CheckCircle className="h-5 w-5 text-emerald-500" />,
      dismissClass: 'text-emerald-500 hover:bg-emerald-100 focus:ring-blue-500',
    },
    warning: {
      containerClass: 'bg-amber-50 border-amber-400 text-amber-800',
      icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
      dismissClass: 'text-amber-500 hover:bg-amber-100 focus:ring-amber-500',
    },
    error: {
      containerClass: 'bg-red-50 border-red-400 text-red-800',
      icon: <AlertCircle className="h-5 w-5 text-red-500" />,
      dismissClass: 'text-red-500 hover:bg-red-100 focus:ring-red-500',
    },
  };

  const config = typeConfig[type] || typeConfig.info;

  return (
    <div className={cn('rounded-lg border-l-4 p-4', config.containerClass, className)} role="alert">
      <div className="flex">
        {showIcon && <div className="flex-shrink-0 mr-3">{config.icon}</div>}
        <div className="flex-1">
          {title && <h3 className="text-sm font-medium mb-1">{title}</h3>}
          <div className="text-sm">{message}</div>
        </div>
        {dismissible && onClose && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={onClose}
                className={cn(
                  'inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2',
                  config.dismissClass
                )}
              >
                <span className="sr-only">Dismiss</span>
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;
