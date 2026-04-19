import React from 'react';

const Card = ({ title, children, footer, className = '', headerExtra, bodyClassName = '', footerClassName = '' }) => {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 ${className}`}>
      {title && (
        <div className={`px-6 py-4 border-b border-slate-200 flex justify-between items-center`}>
          {typeof title === 'string' ? (
            <h3 className="text-[14px] font-semibold text-slate-900">{title}</h3>
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
        <div className={`px-6 py-4 bg-slate-50/70 border-t border-slate-200 ${footerClassName}`}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
