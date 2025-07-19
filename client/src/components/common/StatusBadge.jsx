// client/src/components/common/StatusBadge.jsx
import React from 'react';

const StatusBadge = ({ status }) => {
  // A comprehensive map for all known statuses from constants.js
  const statusStyles = {
    // Applicant Statuses
    'Application Submitted': { variant: 'info', label: 'Submitted' },
    'Under Review': { variant: 'warning', label: 'Under Review' },
    'Profile Approved': { variant: 'success', label: 'Profile Approved' },
    'Profile Rejected': { variant: 'danger', label: 'Profile Rejected' },
    'Skills Assessment Sent': { variant: 'info', label: 'Assessment Sent' },
    'Skills Assessment Completed': { variant: 'primary', label: 'Assessment Done' },
    'Guidelines Sent': { variant: 'info', label: 'Guidelines Sent' },
    'Guidelines Reviewed': { variant: 'primary', label: 'Guidelines Reviewed' },
    'Guidelines Failed': { variant: 'danger', label: 'Guidelines Failed' },
    'Onboarded': { variant: 'success', label: 'Onboarded' },
    'Active Interviewer': { variant: 'success', label: 'Active Interviewer' },
    'Time Slots Confirmed': { variant: 'primary', label: 'Time Slots Confirmed' },

    // Interviewer Statuses
    'On Probation': { variant: 'warning', label: 'On Probation' },
    'Active': { variant: 'success', label: 'Active' },
    'Inactive': { variant: 'gray', label: 'Inactive' },
    'Suspended': { variant: 'danger', label: 'Suspended' },
    'Terminated': { variant: 'danger', label: 'Terminated' },

    // Communication Statuses
    'Queued': { variant: 'info', label: 'Queued' },
    'Sent': { variant: 'primary', label: 'Sent' },
    'Delivered': { variant: 'success', label: 'Delivered' },
    'Failed': { variant: 'danger', label: 'Failed' },
    'Read': { variant: 'success', label: 'Read' },
    
    // ** -- FIX STARTS HERE -- **
    // Skill Assessment Statuses
    'Pending': { variant: 'warning', label: 'Pending Review' },
    'Reviewed': { variant: 'success', label: 'Reviewed' },
    // ** -- FIX ENDS HERE -- **

    // Default Fallback
    'default': { variant: 'secondary', label: 'Unknown' },
  };

  const config = statusStyles[status] || statusStyles['default'];
  
  // Base styling for the badge
  const baseClass = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";

  // Color variants mapping to Tailwind classes, consistent with Badge.jsx
  const variantClasses = {
    primary: 'bg-primary-100 text-primary-800',
    secondary: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    danger: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-blue-100 text-blue-800',
    gray: 'bg-gray-200 text-gray-800',
  };

  const className = `${baseClass} ${variantClasses[config.variant] || variantClasses.secondary}`;

  return (
    <span className={className}>
        {config.label || status}
    </span>
  );
};

export default StatusBadge;