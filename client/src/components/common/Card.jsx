import React from 'react';

const Card = ({ title, children, footer, className = '', headerExtra, bodyClassName = '', footerClassName = '' }) => {
  return (
    <div className={`bg-card text-card-foreground rounded-lg border border-border shadow-brave-card ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-border flex justify-between items-center">
          {typeof title === 'string' ? (
            <h3 className="font-display text-[15px] font-semibold text-foreground">{title}</h3>
          ) : (
            title
          )}
          {headerExtra && <div>{headerExtra}</div>}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
      {footer && (
        <div className={`px-6 py-4 bg-muted/40 border-t border-border ${footerClassName}`}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
