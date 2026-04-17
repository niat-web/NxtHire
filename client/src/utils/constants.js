// client/src/utils/constants.js

// Application status constants (workflow states — NOT admin-configurable)
export const APPLICATION_STATUS = {
  SUBMITTED: 'Application Submitted',
  UNDER_REVIEW: 'Under Review',
  PROFILE_APPROVED: 'Profile Approved',
  PROFILE_REJECTED: 'Profile Rejected',
  SKILLS_ASSESSMENT_SENT: 'Skills Assessment Sent',
  SKILLS_ASSESSMENT_COMPLETED: 'Skills Assessment Completed',
  GUIDELINES_SENT: 'Guidelines Sent',
  GUIDELINES_REVIEWED: 'Guidelines Reviewed',
  GUIDELINES_FAILED: 'Guidelines Failed',
  ONBOARDED: 'Onboarded',
  ACTIVE_INTERVIEWER: 'Active Interviewer',
  TIME_SLOTS_CONFIRMED: 'Time Slots Confirmed'
};

// Interviewer status constants (workflow states — NOT admin-configurable)
export const INTERVIEWER_STATUS = {
  PROBATION: 'On Probation',
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  SUSPENDED: 'Suspended',
  TERMINATED: 'Terminated'
};

// ─── Dynamic constants (admin-managed from /admin/settings) ────────────────
// Domain Names         → useDomainOptions()
// Sourcing Channels    → useSourcingChannels()
// Proficiency Levels   → useProficiencyLevels()
// Payment Tiers        → usePaymentTiers()
// Tech Stacks          → useTechStacks()
// Interview Statuses   → useInterviewStatuses()
// All hooks are in useAdminQueries.js

// Days of week constants (fixed — not admin-configurable)
export const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' }
];

// Time slots constants (30-minute intervals — fixed)
export const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = (i % 2) * 30;
  const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  const displayHour = hour % 12 || 12;
  const ampm = hour < 12 ? 'AM' : 'PM';
  const displayTime = `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
  return { value: time, label: displayTime };
});
