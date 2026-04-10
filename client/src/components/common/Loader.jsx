// client/src/components/common/Loader.jsx
import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const Loader = ({ size = 'md', text = 'Loading...', fullScreen = false }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  const loaderContent = (
    <div className="flex flex-col items-center justify-center">
      <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
      {text && <p className={cn('mt-2 text-muted-foreground', textSizeClasses[size])}>{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 z-50">
        {loaderContent}
      </div>
    );
  }

  return loaderContent;
};

export default Loader;
