import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { adminKeys } from './queryKeys';
import * as adminApi from '../api/admin.api';

// ─── Helper: extract response data ──────────────────────────────────────────
const select = (res) => res.data.data;

// ─── Dashboard ──────────────────────────────────────────────────────────────
export const useDashboardStats = (options) =>
  useQuery({
    queryKey: adminKeys.dashboardStats(),
    queryFn: () => adminApi.getDashboardStats(),
    select,
    staleTime: 2 * 60 * 1000,
    ...options,
  });

export const useDashboardAnalytics = (params, options) =>
  useQuery({
    queryKey: adminKeys.dashboardAnalytics(params),
    queryFn: () => adminApi.getDashboardAnalytics(params),
    select,
    ...options,
  });

export const useLatestInterviewDate = (options) =>
  useQuery({
    queryKey: adminKeys.latestInterviewDate(),
    queryFn: () => adminApi.getLatestInterviewDate(),
    select,
    staleTime: 10 * 60 * 1000,
    ...options,
  });

// ─── Applicants ─────────────────────────────────────────────────────────────
export const useApplicants = (params, options) =>
  useQuery({
    queryKey: adminKeys.applicants(params),
    queryFn: () => adminApi.getApplicants(params),
    select,
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
    ...options,
  });

export const useApplicantDetails = (id, options) =>
  useQuery({
    queryKey: adminKeys.applicantDetails(id),
    queryFn: () => adminApi.getApplicantDetails(id),
    select,
    enabled: !!id,
    ...options,
  });

// ─── Workflow ───────────────────────────────────────────────────────────────
export const useSkillAssessments = (params, options) =>
  useQuery({
    queryKey: adminKeys.skillAssessments(params),
    queryFn: () => adminApi.getSkillAssessments(params),
    select,
    staleTime: 60 * 1000,
    ...options,
  });

export const useGuidelinesSubmissions = (params, options) =>
  useQuery({
    queryKey: adminKeys.guidelinesSubmissions(params),
    queryFn: () => adminApi.getGuidelinesSubmissions(params),
    select,
    staleTime: 60 * 1000,
    ...options,
  });

// ─── Interviewers ───────────────────────────────────────────────────────────
export const useInterviewers = (params, options) =>
  useQuery({
    queryKey: adminKeys.interviewers(params),
    queryFn: () => adminApi.getInterviewers(params),
    select,
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
    ...options,
  });

export const useInterviewerDetails = (id, options) =>
  useQuery({
    queryKey: adminKeys.interviewerDetails(id),
    queryFn: () => adminApi.getInterviewerDetails(id),
    select,
    enabled: !!id,
    ...options,
  });

// ─── Users ──────────────────────────────────────────────────────────────────
export const useUsers = (params, options) =>
  useQuery({
    queryKey: adminKeys.users(params),
    queryFn: () => adminApi.getUsers(params),
    select,
    staleTime: 2 * 60 * 1000,
    placeholderData: keepPreviousData,
    ...options,
  });

// ─── Main Sheet ─────────────────────────────────────────────────────────────
export const useMainSheetEntries = (params, options) =>
  useQuery({
    queryKey: adminKeys.mainSheet(params),
    queryFn: () => adminApi.getMainSheetEntries(params),
    select,
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData,
    ...options,
  });

export const useMainSheetEntry = (id, options) =>
  useQuery({
    queryKey: adminKeys.mainSheetEntry(id),
    queryFn: () => adminApi.getMainSheetEntry(id),
    select,
    enabled: !!id,
    ...options,
  });

export const useHiringNames = (options) =>
  useQuery({
    queryKey: adminKeys.hiringNames(),
    queryFn: () => adminApi.getUniqueHiringNames(),
    select,
    staleTime: 10 * 60 * 1000,
    ...options,
  });

// ─── Interview Bookings ────────────────────────────────────────────────────
export const useInterviewBookings = (options) =>
  useQuery({
    queryKey: adminKeys.interviewBookings(),
    queryFn: () => adminApi.getInterviewBookings(),
    select,
    staleTime: 60 * 1000,
    ...options,
  });

export const useInterviewBookingDetails = (id, options) =>
  useQuery({
    queryKey: adminKeys.interviewBookingDetails(id),
    queryFn: () => adminApi.getInterviewBookingDetails(id),
    select,
    enabled: !!id,
    ...options,
  });

export const useBookingSlots = (params, options) =>
  useQuery({
    queryKey: adminKeys.bookingSlots(params),
    queryFn: () => adminApi.getBookingSlots(params),
    select,
    staleTime: 30 * 1000,
    ...options,
  });

// ─── Public Bookings / Student Pipeline ─────────────────────────────────────
export const usePublicBookings = (options) =>
  useQuery({
    queryKey: adminKeys.publicBookings(),
    queryFn: () => adminApi.getPublicBookings(),
    select,
    staleTime: 60 * 1000,
    ...options,
  });

export const usePublicBookingDetails = (id, options) =>
  useQuery({
    queryKey: adminKeys.publicBookingDetails(id),
    queryFn: () => adminApi.getPublicBookingDetails(id),
    select,
    enabled: !!id,
    ...options,
  });

export const useStudentPipeline = (options) =>
  useQuery({
    queryKey: adminKeys.studentPipeline(),
    queryFn: () => adminApi.getStudentPipeline(),
    select,
    staleTime: 30 * 1000,
    ...options,
  });

export const useHostEmails = (options) =>
  useQuery({
    queryKey: adminKeys.hostEmails(),
    queryFn: () => adminApi.getUniqueHostEmails(),
    select,
    staleTime: 10 * 60 * 1000,
    ...options,
  });

// ─── Domains & Evaluation ──────────────────────────────────────────────────
export const useDomains = (options) =>
  useQuery({
    queryKey: adminKeys.domains(),
    queryFn: () => adminApi.getDomains(),
    select,
    staleTime: 10 * 60 * 1000,
    ...options,
  });

// ─── Domain Options (simple name list, separate from evaluation domains) ───
export const useDomainOptionsList = (options) =>
  useQuery({
    queryKey: adminKeys.domainOptions(),
    queryFn: () => adminApi.getDomainOptions(),
    select,
    staleTime: 10 * 60 * 1000,
    ...options,
  });

// Convenience hook: returns domain options as { value, label } for dropdowns
export const useDomainOptions = () => {
  const { data: domains = [] } = useDomainOptionsList();
  return domains.map(d => ({ value: d.name, label: d.name }));
};

export const useInvalidateDomainOptions = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: adminKeys.domainOptions() });
};

// ─── App Settings (dynamic constants) ──────────────────────────────────────
export const useAppSettings = (category, options) =>
  useQuery({
    queryKey: adminKeys.appSettings(category),
    queryFn: () => adminApi.getAppSettings(category),
    select,
    staleTime: 10 * 60 * 1000,
    enabled: !!category,
    ...options,
  });

export const useAllAppSettings = (options) =>
  useQuery({
    queryKey: adminKeys.allAppSettings(),
    queryFn: () => adminApi.getAllAppSettings(),
    select,
    staleTime: 10 * 60 * 1000,
    ...options,
  });

// Convenience hooks for specific categories
export const useSourcingChannels = () => { const { data = [] } = useAppSettings('sourcing_channels'); return data.map(d => ({ value: d.value, label: d.label })); };
export const useProficiencyLevels = () => { const { data = [] } = useAppSettings('proficiency_levels'); return data.map(d => ({ value: d.value, label: d.label })); };
export const usePaymentTiers = () => { const { data = [] } = useAppSettings('payment_tiers'); return data.map(d => ({ value: d.value, label: d.label, amount: d.amount })); };
export const useTechStacks = () => { const { data = [] } = useAppSettings('tech_stacks'); return data.map(d => ({ value: d.value, label: d.label })); };
export const useInterviewStatuses = () => { const { data = [] } = useAppSettings('interview_statuses'); return data.map(d => ({ value: d.value, label: d.label })); };

export const useInvalidateAppSettings = () => {
  const queryClient = useQueryClient();
  return (category) => {
    if (category) queryClient.invalidateQueries({ queryKey: adminKeys.appSettings(category) });
    queryClient.invalidateQueries({ queryKey: adminKeys.allAppSettings() });
  };
};

export const useEvaluationSheet = (domainId, options) =>
  useQuery({
    queryKey: adminKeys.evaluationSheet(domainId),
    queryFn: () => adminApi.getEvaluationSheet(domainId),
    select,
    enabled: !!domainId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });

export const useEvaluationDataAdmin = (params, options) =>
  useQuery({
    queryKey: adminKeys.evaluationData(params),
    queryFn: () => adminApi.getEvaluationDataForAdmin(params),
    select,
    staleTime: 60 * 1000,
    ...options,
  });

export const useDomainEvaluationSummary = (options) =>
  useQuery({
    queryKey: adminKeys.evaluationSummary(),
    queryFn: () => adminApi.getDomainEvaluationSummary(),
    select,
    staleTime: 5 * 60 * 1000,
    ...options,
  });

export const useAllEvaluationParameters = (options) =>
  useQuery({
    queryKey: adminKeys.evaluationParameters(),
    queryFn: () => adminApi.getAllEvaluationParameters(),
    select,
    staleTime: 10 * 60 * 1000,
    ...options,
  });

// ─── Custom Email Templates ────────────────────────────────────────────────
export const useCustomEmailTemplates = (options) =>
  useQuery({
    queryKey: adminKeys.customEmailTemplates(),
    queryFn: () => adminApi.getCustomEmailTemplates(),
    select,
    staleTime: 5 * 60 * 1000,
    ...options,
  });

// ─── Payments & Earnings ───────────────────────────────────────────────────
export const usePayoutSheet = (params, options) =>
  useQuery({
    queryKey: adminKeys.payoutSheet(params),
    queryFn: () => adminApi.getPayoutSheet(params),
    select,
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
    ...options,
  });

export const usePaymentRequests = (params, options) =>
  useQuery({
    queryKey: adminKeys.paymentRequests(params),
    queryFn: () => adminApi.getPaymentRequests(params),
    select,
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData,
    ...options,
  });

export const useYearlyEarnings = (year, options) =>
  useQuery({
    queryKey: adminKeys.yearlyEarnings(year),
    queryFn: () => adminApi.getYearlyEarningsSummary(year),
    select,
    staleTime: 5 * 60 * 1000,
    enabled: !!year,
    ...options,
  });

export const useMonthlyEarnings = (year, month, options) =>
  useQuery({
    queryKey: adminKeys.monthlyEarnings(year, month),
    queryFn: () => adminApi.getMonthlyEarningsDetails(year, month),
    select,
    staleTime: 5 * 60 * 1000,
    enabled: !!year && month !== undefined,
    ...options,
  });

// ─── Evaluation data for a public booking (by student emails) ──────────────
export const useEvaluationByPublicBooking = (bookingId, params, options) =>
  useQuery({
    queryKey: adminKeys.evaluationByPublicBooking(bookingId, params),
    queryFn: () => adminApi.getEvaluationByPublicBooking(bookingId, params),
    select,
    enabled: !!bookingId,
    staleTime: 60 * 1000,
    ...options,
  });

// ─── Domains for a specific Hiring Name ────────────────────────────────────
export const useDomainsForHiringName = (hiringName, options) =>
  useQuery({
    queryKey: adminKeys.domainsForHiring(hiringName),
    queryFn: () => adminApi.getDomainsForHiringName(hiringName),
    select,
    enabled: !!hiringName,
    staleTime: 5 * 60 * 1000,
    ...options,
  });

// ─── Notification Settings ─────────────────────────────────────────────────
export const useNotificationSettings = (options) =>
  useQuery({
    queryKey: adminKeys.notificationSettings(),
    queryFn: () => adminApi.getNotificationSettings(),
    select,
    staleTime: 5 * 60 * 1000,
    ...options,
  });

// ─── Invalidation helpers ──────────────────────────────────────────────────
export const useInvalidateAdmin = () => {
  const queryClient = useQueryClient();
  return {
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: adminKeys.all }),
    invalidateDashboard: () => queryClient.invalidateQueries({ queryKey: adminKeys.dashboardStats() }),
    invalidateApplicants: () => queryClient.invalidateQueries({ queryKey: [...adminKeys.all, 'applicants'] }),
    invalidateInterviewers: () => queryClient.invalidateQueries({ queryKey: [...adminKeys.all, 'interviewers'] }),
    invalidateUsers: () => queryClient.invalidateQueries({ queryKey: [...adminKeys.all, 'users'] }),
    invalidateMainSheet: () => queryClient.invalidateQueries({ queryKey: [...adminKeys.all, 'main-sheet'] }),
    invalidateBookings: () => queryClient.invalidateQueries({ queryKey: [...adminKeys.all, 'interview-bookings'] }),
    invalidateBookingSlots: () => queryClient.invalidateQueries({ queryKey: [...adminKeys.all, 'booking-slots'] }),
    invalidatePublicBookings: () => queryClient.invalidateQueries({ queryKey: [...adminKeys.all, 'public-bookings'] }),
    invalidateStudentPipeline: () => queryClient.invalidateQueries({ queryKey: adminKeys.studentPipeline() }),
    invalidateDomains: () => queryClient.invalidateQueries({ queryKey: adminKeys.domains() }),
    invalidateCustomEmails: () => queryClient.invalidateQueries({ queryKey: adminKeys.customEmailTemplates() }),
    invalidatePayments: () => queryClient.invalidateQueries({ queryKey: [...adminKeys.all, 'payment-requests'] }),
    invalidateGuidelines: () => queryClient.invalidateQueries({ queryKey: [...adminKeys.all, 'guidelines'] }),
    invalidateSkillAssessments: () => queryClient.invalidateQueries({ queryKey: [...adminKeys.all, 'skill-assessments'] }),
    invalidateNotificationSettings: () => queryClient.invalidateQueries({ queryKey: adminKeys.notificationSettings() }),
  };
};
