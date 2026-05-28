import React from 'react';
import { cn } from '@/lib/utils';

// Editorial icon tile — outlined square with a lucide glyph centered inside.
// Use wherever you'd otherwise give an icon a tinted background square.
// Sizes follow the icon system spec:
//   sm  : 32px tile, 14px icon — card chrome, list rows
//   md  : 36px tile, 16px icon — default
//   lg  : 44px tile, 20px icon — feature tiles
//   xl  : 64px tile, 24px icon — empty states
//
// Status colors are intentionally NOT built in. For semantic status pills,
// use <Badge variant="success|warning|danger" /> instead — tiles stay neutral.
const SIZE = {
  sm: { tile: 'h-8 w-8 rounded-lg',    icon: 'h-3.5 w-3.5' },
  md: { tile: 'h-9 w-9 rounded-lg',    icon: 'h-4 w-4' },
  lg: { tile: 'h-11 w-11 rounded-xl',  icon: 'h-5 w-5' },
  xl: { tile: 'h-16 w-16 rounded-2xl', icon: 'h-6 w-6' },
};

const IconTile = ({ icon: Icon, size = 'md', className, iconClassName, accent = false, ...rest }) => {
  const s = SIZE[size] || SIZE.md;
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center border border-slate-200 bg-white text-slate-700 transition-colors',
        s.tile,
        className,
      )}
      {...rest}
    >
      <Icon
        className={cn(s.icon, iconClassName)}
        style={accent ? { color: '#C0392B' } : undefined}
        aria-hidden="true"
      />
    </span>
  );
};

export default IconTile;
