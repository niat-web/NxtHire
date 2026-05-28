import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:     'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline:     'border border-primary bg-card text-primary hover:bg-primary hover:text-primary-foreground',
        secondary:   'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost:       'text-foreground hover:bg-muted hover:text-foreground',
        link:        'text-primary underline-offset-4 hover:underline hover:text-primary/80',
        success:     'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700',
        amber:       'shadow-sm',
      },
      size: {
        default: 'h-10 px-5',
        sm:      'h-8 px-3 text-[12px]',
        lg:      'h-11 px-6',
        icon:    'h-10 w-10',
        xs:      'h-7 px-2.5 text-[11.5px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, isLoading, children, style, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    const amberStyle = variant === 'amber'
      ? { backgroundColor: 'var(--brave-amber)', color: 'var(--brave-ink)', ...(style || {}) }
      : style;
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isLoading || props.disabled}
        style={amberStyle}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {children}
          </>
        )}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
