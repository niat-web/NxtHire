// client/src/components/common/Loader.jsx
import React from 'react';

const Loader = ({ size = 'md', text = 'Loading...', fullScreen = false }) => {
    // Size classes for spinner
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-8 w-8',
      lg: 'h-12 w-12',
      xl: 'h-16 w-16'
    };
  
    // Text size classes
    const textSizeClasses = {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
      xl: 'text-lg'
    };
  
    const loaderContent = (
      <div className="flex flex-col items-center justify-center">
        <div className={`animate-spin rounded-full border-t-2 border-b-2 border-primary-600 ${sizeClasses[size]}`}></div>
        {text && <p className={`mt-2 text-gray-500 ${textSizeClasses[size]}`}>{text}</p>}
      </div>
    );
  
    if (fullScreen) {
      return (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
          {loaderContent}
        </div>
      );
    }
  
    return loaderContent;
  };
  
  export default Loader;