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
          className={`block text-[12.5px] font-semibold text-foreground/90 mb-1.5 ${labelClassName}`}
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
        className={`w-full px-4 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground/70 border ${
          error ? 'border-red-300' : 'border-border'
        } rounded-xl bg-white transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-none ${
          disabled ? 'bg-muted/40 text-muted-foreground/70' : ''
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

Textarea.displayName = 'Textarea';

export default Textarea;
