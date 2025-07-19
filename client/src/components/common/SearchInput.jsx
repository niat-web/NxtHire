// client/src/components/common/SearchInput.jsx
import React from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

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
    <div className={`relative rounded-md shadow-sm ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <FiSearch className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        value={value}
        onChange={onChange}
        className={`block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
          disabled ? 'bg-gray-100' : ''
        } ${inputClassName}`}
        placeholder={placeholder}
        disabled={disabled}
        {...props}
      />
      {value && onClear && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          <button
            type="button"
            onClick={onClear}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
            disabled={disabled}
          >
            <span className="sr-only">Clear search</span>
            <FiX className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchInput;