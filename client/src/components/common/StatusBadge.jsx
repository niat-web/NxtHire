// client/src/components/common/StatusBadge.jsx
import React from 'react';
import { Badge } from '@/components/ui/badge';

const variantMap = {
  primary: 'purple',
  secondary: 'secondary',
  success: 'success',
  danger: 'danger',
  warning: 'warning',
  info: 'info',
  gray: 'gray',
};

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

    // Main Sheet / Interview Statuses
    'Scheduled': { variant: 'primary', label: 'Scheduled' },
    'Completed': { variant: 'success', label: 'Completed' },
    'InProgress': { variant: 'warning', label: 'In Progress' },
    'Cancelled': { variant: 'danger', label: 'Cancelled' },
    'Pending Student Booking': { variant: 'gray', label: 'Pending' },

    // Skill Assessment Statuses
    'Pending': { variant: 'warning', label: 'Pending Review' },
    'Reviewed': { variant: 'success', label: 'Reviewed' },

    // Default Fallback
    'default': { variant: 'secondary', label: 'Unknown' },
  };

  const config = statusStyles[status] || statusStyles['default'];
  const uiVariant = variantMap[config.variant] || 'secondary';

  return (
    <Badge variant={uiVariant}>
      {config.label || status}
    </Badge>
  );
};

export default StatusBadge;
