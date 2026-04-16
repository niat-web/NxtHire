// client/src/components/common/Loader.jsx
import { cn } from '@/lib/utils';

const Loader = ({ size = 'md', text, fullScreen = false, className }) => {
  const sizes = {
    sm: { spinner: 'w-5 h-5', border: 'border-2', text: 'text-xs mt-2' },
    md: { spinner: 'w-8 h-8', border: 'border-[2.5px]', text: 'text-xs mt-2.5' },
    lg: { spinner: 'w-10 h-10', border: 'border-[3px]', text: 'text-sm mt-3' },
    xl: { spinner: 'w-14 h-14', border: 'border-[3px]', text: 'text-sm mt-3.5' },
  };

  const s = sizes[size] || sizes.md;

  const content = (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <div className="relative">
        {/* Track ring */}
        <div className={cn('rounded-full border-slate-200', s.spinner, s.border)} />
        {/* Spinning arc */}
        <div
          className={cn(
            'absolute inset-0 rounded-full border-transparent border-t-blue-600 border-r-blue-600 animate-spin',
            s.spinner,
            s.border
          )}
        />
      </div>
      {text && (
        <p className={cn('text-slate-400 font-medium', s.text)}>{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
        {content}
      </div>
    );
  }

  return content;
};

export default Loader;
