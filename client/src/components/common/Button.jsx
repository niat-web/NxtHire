// client/src/components/common/Button.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Button as UiButton, buttonVariants } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Map old variant names to new ui/button variants
const variantMap = {
  primary: 'default',
  outline: 'outline',
  danger: 'destructive',
  success: 'success',
  ghost: 'ghost',
};

const Button = ({ children, to, variant = 'primary', icon, iconPosition = 'left', isLoading = false, className, size, disabled, onClick, ...props }) => {
  const mappedVariant = variantMap[variant] || 'default';

  // Icon content shared by both paths
  const iconContent = (
    <>
      {!isLoading && icon && iconPosition === 'left' && <span className="mr-2 -ml-1 h-5 w-5 inline-flex items-center justify-center">{icon}</span>}
      {children}
      {!isLoading && icon && iconPosition === 'right' && <span className="ml-2 -mr-1 h-5 w-5 inline-flex items-center justify-center">{icon}</span>}
    </>
  );

  if (to) {
    // For Link: use buttonVariants for styling and handle spinner manually
    return (
      <Link
        to={isLoading ? '#' : to}
        onClick={isLoading ? (e) => e.preventDefault() : onClick}
        tabIndex={isLoading ? -1 : undefined}
        className={cn(
          buttonVariants({ variant: mappedVariant, size }),
          (isLoading || disabled) && 'pointer-events-none opacity-50',
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {iconContent}
      </Link>
    );
  }

  // For button: delegate to UiButton which handles isLoading spinner
  return (
    <UiButton
      variant={mappedVariant}
      size={size}
      isLoading={isLoading}
      disabled={disabled}
      onClick={onClick}
      className={className}
      {...props}
    >
      {iconContent}
    </UiButton>
  );
};

export default Button;
