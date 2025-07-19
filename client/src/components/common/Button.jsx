import React from 'react';
import { Link } from 'react-router-dom';
import { FiLoader } from 'react-icons/fi'; // <-- Add this import for the loading spinner

const Button = ({ children, to, variant = 'primary', icon, iconPosition = 'left', isLoading = false, ...props }) => {
  // Base classes for consistent styling
  const baseClasses = 'inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  // Variant-specific classes
  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-primary-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    ghost: 'text-primary-600 hover:bg-primary-50 focus:ring-primary-500'
  };
  
  // Combine all classes
  const classes = `${baseClasses} ${variantClasses[variant] || variantClasses.primary} ${props.className || ''}`;

  // Content of the button: text and icon/loader
  const content = (
    <>
      {isLoading ? ( // If isLoading is true, show spinner
        <FiLoader className="animate-spin mr-2 -ml-1 h-5 w-5" />
      ) : ( // Otherwise, show provided icon (if any)
        icon && iconPosition === 'left' && <span className="mr-2 -ml-1 h-5 w-5">{icon}</span>
      )}
      {/* Show children text or 'Loading...' based on isLoading state */}
      {isLoading ? 'Loading...' : children} 
      {!isLoading && icon && iconPosition === 'right' && <span className="ml-2 -mr-1 h-5 w-5">{icon}</span>}
    </>
  );
  
  if (to) {
    // If 'to' prop is present, render a react-router-dom Link component
    // Important: `isLoading` should effectively disable the link visually and functionally if possible,
    // though React Router links don't have a direct `disabled` prop in the same way as buttons.
    // We disable clicks if isLoading is true.
    return <Link to={isLoading ? '#' : to} onClick={isLoading ? (e) => e.preventDefault() : props.onClick} className={classes} {...props}>{content}</Link>;
  }

  // Otherwise, render a regular button
  return (
    <button 
      {...props} 
      className={classes} 
      disabled={isLoading || props.disabled} // Disable button if isLoading is true OR if it was already disabled by other props
    >
      {content}
    </button>
  );
};

export default Button;