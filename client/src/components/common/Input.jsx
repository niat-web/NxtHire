import React, { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  name,
  type = 'text',
  placeholder = '',
  error = null,
  helpText = null,
  className = '',
  labelClassName = '',
  inputClassName = '',
  errorClassName = '',
  helpTextClassName = '',
  required = false,
  disabled = false,
  ...props
}, ref) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className={`block text-[12.5px] font-semibold text-slate-700 mb-1.5 ${labelClassName}`}
        >
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        id={name}
        name={name}
        placeholder={placeholder}
        className={`w-full h-10 px-4 text-[13px] text-slate-900 placeholder:text-slate-400 border ${
          error ? 'border-red-300' : 'border-slate-200'
        } rounded-lg bg-white transition-colors focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:outline-none ${
          disabled ? 'bg-slate-50 text-slate-400' : ''
        } ${inputClassName}`}
        disabled={disabled}
        required={required}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${name}-error` : helpText ? `${name}-description` : undefined}
        {...props}
      />
      {error && (
        <p
          id={`${name}-error`}
          className={`mt-1.5 text-[12px] text-red-600 ${errorClassName}`}
        >
          {error}
        </p>
      )}
      {helpText && !error && (
        <p
          id={`${name}-description`}
          className={`mt-1.5 text-[12px] text-slate-500 ${helpTextClassName}`}
        >
          {helpText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
