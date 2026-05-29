import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide transition-colors focus:outline-none',
  {
    variants: {
      variant: {
        default: 'border-primary/10 bg-primary text-white',
        secondary: 'border-border bg-muted/40 text-foreground/90',
        destructive: 'border-red-200 bg-red-50 text-red-700',
        outline: 'border-border text-foreground/90',
        success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        warning: 'border-amber-200 bg-amber-50 text-amber-800',
        danger: 'border-red-200 bg-red-50 text-red-700',
        info: 'border-border bg-muted/40 text-foreground/90',
        purple: 'border-border bg-muted/40 text-foreground/90',
        gray: 'border-border bg-muted/40 text-foreground/80',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
