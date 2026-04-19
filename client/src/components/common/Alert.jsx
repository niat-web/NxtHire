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
      containerClass: 'bg-slate-50 border-slate-200 text-slate-700',
      icon: <Info className="h-4 w-4 text-slate-500" />,
      dismissClass: 'text-slate-500 hover:bg-slate-100 focus:ring-slate-400',
    },
    success: {
      containerClass: 'bg-emerald-50/60 border-emerald-200 text-emerald-800',
      icon: <CheckCircle className="h-4 w-4 text-emerald-600" />,
      dismissClass: 'text-emerald-600 hover:bg-emerald-100 focus:ring-emerald-500',
    },
    warning: {
      containerClass: 'bg-amber-50/60 border-amber-200 text-amber-800',
      icon: <AlertTriangle className="h-4 w-4 text-amber-600" />,
      dismissClass: 'text-amber-600 hover:bg-amber-100 focus:ring-amber-500',
    },
    error: {
      containerClass: 'bg-red-50 border-red-200 text-red-700',
      icon: <AlertCircle className="h-4 w-4 text-red-600" />,
      dismissClass: 'text-red-600 hover:bg-red-100 focus:ring-red-500',
    },
  };

  const config = typeConfig[type] || typeConfig.info;

  return (
    <div className={cn('rounded-2xl border px-4 py-3', config.containerClass, className)} role="alert">
      <div className="flex items-start">
        {showIcon && <div className="flex-shrink-0 mr-3 mt-0.5">{config.icon}</div>}
        <div className="flex-1">
          {title && <h3 className="text-[13px] font-semibold mb-0.5">{title}</h3>}
          <div className="text-[13px] leading-relaxed">{message}</div>
        </div>
        {dismissible && onClose && (
          <div className="ml-auto pl-3">
            <button
              type="button"
              onClick={onClose}
              className={cn(
                'inline-flex rounded-full p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2',
                config.dismissClass
              )}
            >
              <span className="sr-only">Dismiss</span>
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;
