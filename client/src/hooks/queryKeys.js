// Centralized query key factory for TanStack Query cache management.
// Using a factory pattern so keys are consistent and easy to invalidate.

export const adminKeys = {
  all: ['admin'],
  dashboardStats: () => [...adminKeys.all, 'dashboard-stats'],
  dashboardAnalytics: (params) => [...adminKeys.all, 'dashboard-analytics', params],
  latestInterviewDate: () => [...adminKeys.all, 'latest-interview-date'],

  applicants: (params) => [...adminKeys.all, 'applicants', params],
  applicantDetails: (id) => [...adminKeys.all, 'applicant', id],

  skillAssessments: (params) => [...adminKeys.all, 'skill-assessments', params],
  guidelinesSubmissions: (params) => [...adminKeys.all, 'guidelines', params],

  interviewers: (params) => [...adminKeys.all, 'interviewers', params],
  interviewerDetails: (id) => [...adminKeys.all, 'interviewer', id],

  users: (params) => [...adminKeys.all, 'users', params],

  mainSheet: (params) => [...adminKeys.all, 'main-sheet', params],
  mainSheetEntry: (id) => [...adminKeys.all, 'main-sheet-entry', id],
  hiringNames: () => [...adminKeys.all, 'hiring-names'],

  interviewBookings: () => [...adminKeys.all, 'interview-bookings'],
  interviewBookingDetails: (id) => [...adminKeys.all, 'interview-booking', id],
  bookingSlots: (params) => [...adminKeys.all, 'booking-slots', params],

  publicBookings: () => [...adminKeys.all, 'public-bookings'],
  publicBookingDetails: (id) => [...adminKeys.all, 'public-booking', id],
  studentPipeline: () => [...adminKeys.all, 'student-pipeline'],
  hostEmails: () => [...adminKeys.all, 'host-emails'],

  domains: () => [...adminKeys.all, 'domains'],
  evaluationSheet: (domainId) => [...adminKeys.all, 'evaluation-sheet', domainId],
  evaluationData: (params) => [...adminKeys.all, 'evaluation-data', params],
  evaluationSummary: () => [...adminKeys.all, 'evaluation-summary'],
  evaluationParameters: () => [...adminKeys.all, 'evaluation-parameters'],

  customEmailTemplates: () => [...adminKeys.all, 'custom-email-templates'],

  payoutSheet: (params) => [...adminKeys.all, 'payout-sheet', params],
  paymentRequests: (params) => [...adminKeys.all, 'payment-requests', params],
  yearlyEarnings: (year) => [...adminKeys.all, 'yearly-earnings', year],
  monthlyEarnings: (year, month) => [...adminKeys.all, 'monthly-earnings', year, month],
};

export const interviewerKeys = {
  all: ['interviewer'],
  metrics: () => [...interviewerKeys.all, 'metrics'],
  profile: () => [...interviewerKeys.all, 'profile'],
  assignedInterviews: () => [...interviewerKeys.all, 'assigned-interviews'],
  assignedDomains: () => [...interviewerKeys.all, 'assigned-domains'],
  evaluationSummary: () => [...interviewerKeys.all, 'evaluation-summary'],
  evaluationData: (params) => [...interviewerKeys.all, 'evaluation-data', params],
  bookingRequests: () => [...interviewerKeys.all, 'booking-requests'],
  paymentHistory: (params) => [...interviewerKeys.all, 'payment-history', params],
};

export const publicKeys = {
  all: ['public'],
  availableSlots: (publicId) => [...publicKeys.all, 'slots', publicId],
  paymentConfirmation: (token) => [...publicKeys.all, 'payment-confirmation', token],
  paymentReceived: (token) => [...publicKeys.all, 'payment-received', token],
};

export const applicantKeys = {
  all: ['applicant'],
  status: (id) => [...applicantKeys.all, 'status', id],
};
