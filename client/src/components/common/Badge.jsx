// client/src/components/common/Badge.jsx
import React from 'react';
import { Badge as UiBadge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Map old variant names to new ui/badge variants
const variantMap = {
  primary: 'purple',
  secondary: 'secondary',
  success: 'success',
  danger: 'danger',
  warning: 'warning',
  info: 'info',
  gray: 'gray',
};

const Badge = ({
  children,
  variant = 'primary',
  size = 'md',
  rounded = false,
  className = '',
  ...props
}) => {
  const mappedVariant = variantMap[variant] || 'default';

  // Size classes to preserve backward compatibility
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base',
  };

  return (
    <UiBadge
      variant={mappedVariant}
      className={cn(
        sizeClasses[size],
        !rounded && 'rounded',
        className
      )}
      {...props}
    >
      {children}
    </UiBadge>
  );
};

export default Badge;
