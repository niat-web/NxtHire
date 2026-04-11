// client/src/components/common/Loader.jsx
import { cn } from '@/lib/utils';

const dotColors = ['bg-red-500', 'bg-blue-500', 'bg-green-600', 'bg-yellow-400', 'bg-orange-500'];

const Loader = ({ size = 'md', text, fullScreen = false, className }) => {
  const dotSizes = { sm: 'w-1.5 h-1.5', md: 'w-2.5 h-2.5', lg: 'w-3.5 h-3.5', xl: 'w-5 h-5' };
  const gapSizes = { sm: 'gap-1', md: 'gap-1.5', lg: 'gap-2', xl: 'gap-3' };
  const textSizes = { sm: 'text-xs', md: 'text-xs', lg: 'text-sm', xl: 'text-base' };

  const content = (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <div className={cn('flex items-center', gapSizes[size])}>
        {dotColors.map((color, i) => (
          <div
            key={i}
            className={cn('rounded-full dot-bounce', dotSizes[size], color)}
            style={{ animationDelay: `${i * 0.12}s` }}
          />
        ))}
      </div>
      {text && <p className={cn('mt-3 text-gray-400 font-medium', textSizes[size])}>{text}</p>}
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
