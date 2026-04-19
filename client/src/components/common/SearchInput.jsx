// client/src/components/common/SearchInput.jsx
import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const SearchInput = ({
  value,
  onChange,
  onClear,
  placeholder = 'Search...',
  className = '',
  inputClassName = '',
  disabled = false,
  ...props
}) => {
  return (
    <div className={cn('relative', className)}>
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-slate-400" />
      </div>
      <Input
        type="text"
        value={value}
        onChange={onChange}
        className={cn('h-10 rounded-full pl-10 pr-10', inputClassName)}
        placeholder={placeholder}
        disabled={disabled}
        {...props}
      />
      {value && onClear && (
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
          <button
            type="button"
            onClick={onClear}
            className="text-slate-400 hover:text-slate-900 focus:outline-none transition-colors"
            disabled={disabled}
          >
            <span className="sr-only">Clear search</span>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchInput;
