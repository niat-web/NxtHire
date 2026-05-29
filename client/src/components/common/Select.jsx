import React, { forwardRef } from 'react';

const Select = forwardRef(({
  label,
  name,
  options = [],
  placeholder = 'Select an option',
  error = null,
  helpText = null,
  className = '',
  labelClassName = '',
  selectClassName = '',
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
          className={`block text-[12.5px] font-semibold text-foreground/90 mb-1.5 ${labelClassName}`}
        >
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}
      <select
        ref={ref}
        id={name}
        name={name}
        className={`w-full h-10 px-4 text-[13px] text-foreground border ${
          error ? 'border-red-300' : 'border-border'
        } rounded-lg bg-white transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-none ${
          disabled ? 'bg-muted/40 text-muted-foreground/70' : ''
        } ${selectClassName}`}
        disabled={disabled}
        required={required}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${name}-error` : helpText ? `${name}-description` : undefined}
        {...props}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
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
          className={`mt-1.5 text-[12px] text-muted-foreground ${helpTextClassName}`}
        >
          {helpText}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
