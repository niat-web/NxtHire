import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide transition-colors focus:outline-none',
  {
    variants: {
      variant: {
        default: 'border-slate-900/10 bg-slate-900 text-white',
        secondary: 'border-slate-200 bg-slate-50 text-slate-700',
        destructive: 'border-red-200 bg-red-50 text-red-700',
        outline: 'border-slate-200 text-slate-700',
        success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        warning: 'border-amber-200 bg-amber-50 text-amber-800',
        danger: 'border-red-200 bg-red-50 text-red-700',
        info: 'border-slate-200 bg-slate-50 text-slate-700',
        purple: 'border-slate-200 bg-slate-50 text-slate-700',
        gray: 'border-slate-200 bg-slate-50 text-slate-600',
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
