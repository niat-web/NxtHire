// client/src/components/common/Textarea.jsx
import React, { forwardRef } from 'react';

const Textarea = forwardRef(({ 
  label,
  name,
  placeholder = '',
  error = null,
  helpText = null,
  className = '',
  labelClassName = '',
  textareaClassName = '',
  errorClassName = '',
  helpTextClassName = '',
  required = false,
  disabled = false,
  rows = 4,
  ...props
}, ref) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label 
          htmlFor={name} 
          className={`block text-sm font-medium text-gray-700 mb-1 ${labelClassName}`}
        >
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={name}
        name={name}
        rows={rows}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border ${
          error ? 'border-red-300' : 'border-gray-300'
        } rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
          disabled ? 'bg-gray-100' : ''
        } ${textareaClassName}`}
        disabled={disabled}
        required={required}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${name}-error` : helpText ? `${name}-description` : undefined}
        {...props}
      />
      {error && (
        <p 
          id={`${name}-error`} 
          className={`mt-1 text-sm text-red-600 ${errorClassName}`}
        >
          {error}
        </p>
      )}
      {helpText && !error && (
        <p 
          id={`${name}-description`} 
          className={`mt-1 text-sm text-gray-500 ${helpTextClassName}`}
        >
          {helpText}
        </p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;
