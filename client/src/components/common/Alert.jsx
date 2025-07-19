// client/src/components/common/Alert.jsx
import React from 'react';
import { FiAlertCircle, FiCheckCircle, FiInfo, FiAlertTriangle, FiX } from 'react-icons/fi';

const Alert = ({ 
  type = 'info', 
  title, 
  message, 
  onClose, 
  className = '',
  showIcon = true,
  dismissible = false,
}) => {
  // Type based classes and icons
  const typeConfig = {
    info: {
      containerClass: 'bg-blue-50 border-blue-400 text-blue-800',
      icon: <FiInfo className="h-5 w-5 text-blue-500" />,
    },
    success: {
      containerClass: 'bg-green-50 border-green-400 text-green-800',
      icon: <FiCheckCircle className="h-5 w-5 text-green-500" />,
    },
    warning: {
      containerClass: 'bg-yellow-50 border-yellow-400 text-yellow-800',
      icon: <FiAlertTriangle className="h-5 w-5 text-yellow-500" />,
    },
    error: {
      containerClass: 'bg-red-50 border-red-400 text-red-800',
      icon: <FiAlertCircle className="h-5 w-5 text-red-500" />,
    },
  };

  const { containerClass, icon } = typeConfig[type] || typeConfig.info;

  return (
    <div className={`rounded-md border-l-4 p-4 ${containerClass} ${className}`} role="alert">
      <div className="flex">
        {showIcon && <div className="flex-shrink-0 mr-3">{icon}</div>}
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
                className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  type === 'info' ? 'text-blue-500 hover:bg-blue-100 focus:ring-blue-500' :
                  type === 'success' ? 'text-green-500 hover:bg-green-100 focus:ring-green-500' :
                  type === 'warning' ? 'text-yellow-500 hover:bg-yellow-100 focus:ring-yellow-500' :
                  'text-red-500 hover:bg-red-100 focus:ring-red-500'
                }`}
              >
                <span className="sr-only">Dismiss</span>
                <FiX className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;
