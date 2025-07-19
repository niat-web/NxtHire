// client/src/components/common/Card.jsx
import React from 'react';

const Card = ({ title, children, footer, className = '', headerExtra, bodyClassName = '', footerClassName = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {title && (
        <div className={`px-6 py-4 border-b border-gray-200 flex justify-between items-center`}>
          {typeof title === 'string' ? (
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          ) : (
            title
          )}
          {headerExtra && <div>{headerExtra}</div>}
        </div>
      )}
      <div className={` ${bodyClassName}`}>
        {children}
      </div>
      {footer && (
        <div className={`px-6 py-4 bg-gray-50 border-t border-gray-200 ${footerClassName}`}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;