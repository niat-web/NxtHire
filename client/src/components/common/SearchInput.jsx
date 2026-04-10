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
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-muted-foreground" />
      </div>
      <Input
        type="text"
        value={value}
        onChange={onChange}
        className={cn('pl-10 pr-10', inputClassName)}
        placeholder={placeholder}
        disabled={disabled}
        {...props}
      />
      {value && onClear && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          <button
            type="button"
            onClick={onClear}
            className="text-muted-foreground hover:text-foreground focus:outline-none transition-colors"
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
