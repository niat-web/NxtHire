import api from './axios';

// --- ADDITION START ---
export const getYearlyEarningsSummary = (year) => {
  return api.get(`/api/admin/earnings/yearly-summary?year=${year}`);
};
export const getMonthlyEarningsDetails = (year, month) => {
  return api.get(`/api/admin/earnings/monthly-details?year=${year}&month=${month}`);
};
// --- ADDITION END ---

// --- NEW: Get summary statistics for the domain evaluation page ---
export const getDomainEvaluationSummary = () => {
    return api.get('/api/admin/evaluation-summary');
};

// --- NEW: Get all evaluation parameters from all domains for the import feature ---
export const getAllEvaluationParameters = () => {
    return api.get('/api/admin/evaluation-parameters/all');
};

// --- MODIFICATION START: New API function for Admin Domain Evaluation ---
export const getEvaluationDataForAdmin = (params) => {
    // When a domain is selected, use the RESTful path-param URL.
    // Otherwise fall back to the query-param endpoint (no-op return).
    if (params && params.domain) {
        const { domain, ...rest } = params;
        return api.get(`/api/admin/evaluation-data/domain/${encodeURIComponent(domain)}`, { params: rest });
    }
    return api.get('/api/admin/evaluation-data', { params });
};
// --- MODIFICATION END ---

export const getDomainsForHiringName = (hiringName) => {
    return api.get(`/api/admin/evaluation-data/domains-by-hiring/${encodeURIComponent(hiringName)}`);
};

export const getEvaluationByPublicBooking = (bookingId, params) => {
    return api.get(`/api/admin/evaluation-data/by-public-booking/${bookingId}`, { params });
};

// --- App Settings (dynamic constants) ---
// Use role-aware path — interviewers can't access /api/admin routes
const getSettingsBasePath = () => {
    const cached = localStorage.getItem('cachedUser');
    if (cached) {
        try { const user = JSON.parse(cached); if (user.role === 'interviewer') return '/api/interviewer'; } catch {}
    }
    return '/api/admin';
};
export const getAllAppSettings = () => api.get(`${getSettingsBasePath()}/app-settings`);
export const getAppSettings = (category) => api.get(`${getSettingsBasePath()}/app-settings/${category}`);
export const createAppSetting = (category, data) => api.post(`/api/admin/app-settings/${category}`, data);
export const updateAppSetting = (id, data) => api.put(`/api/admin/app-settings/item/${id}`, data);
export const deleteAppSetting = (id) => api.delete(`/api/admin/app-settings/item/${id}`);
export const seedAllAppSettings = () => api.post('/api/admin/app-settings/seed-all');

// --- Add slots to existing public booking ---
export const addSlotsToPublicBooking = (id, data) => api.put(`/api/admin/public-bookings/${id}/add-slots`, data);

// --- Domain Options (simple name list for dropdowns) ---
export const getDomainOptions = () => api.get(`${getSettingsBasePath()}/domain-options`);
export const createDomainOption = (data) => api.post('/api/admin/domain-options', data);
export const updateDomainOption = (id, data) => api.put(`/api/admin/domain-options/${id}`, data);
export const deleteDomainOption = (id) => api.delete(`/api/admin/domain-options/${id}`);
export const seedDomainOptions = () => api.post('/api/admin/domain-options/seed');

// --- Applicants ---
export const getApplicants = (params) => {
  return api.get('/api/admin/applicants', { params });
};
export const exportApplicants = (params) => {
  return api.get('/api/admin/applicants/export', { params, responseType: 'blob' });
};
export const createApplicant = (data) => {
  return api.post('/api/admin/applicants', data);
};
export const updateApplicant = (id, data) => {
  return api.put(`/api/admin/applicants/${id}`, data);
};
export const deleteApplicant = (id) => {
  return api.delete(`/api/admin/applicants/${id}`);
};
export const getApplicantDetails = (id) => {
  return api.get(`/api/admin/applicants/${id}`);
};

// --- Workflow ---
export const processLinkedInReview = (id, data) => {
  return api.post(`/api/admin/applicants/${id}/linkedin-review`, data);
};
export const getSkillAssessments = (params) => {
  return api.get('/api/admin/skill-assessments', { params });
};
export const processSkillCategorization = (id, data) => {
  return api.post(`/api/admin/skill-assessments/${id}/categorize`, data);
};
export const manualOnboard = (id, data) => {
  return api.post(`/api/admin/applicants/${id}/manual-onboard`, data);
};
export const updateApplicantStatus = (id, data) => {
  return api.put(`/api/admin/applicants/${id}/status`, data);
};
export const getGuidelinesSubmissions = (params) => {
    return api.get('/api/admin/guidelines', { params });
};
export const reviewGuidelinesSubmission = (id, data) => {
    return api.post(`/api/admin/guidelines/${id}/review`, data);
};

// --- Interviewers ---
export const getInterviewers = (params) => {
    return api.get('/api/admin/interviewers', { params });
};
export const getInterviewerDetails = (id) => {
    return api.get(`/api/admin/interviewers/${id}`);
};
export const createInterviewer = (data) => {
    return api.post('/api/admin/interviewers', data);
};
export const updateInterviewer = (id, data) => {
    return api.put(`/api/admin/interviewers/${id}`, data);
};
export const deleteInterviewer = (id) => {
    return api.delete(`/api/admin/interviewers/${id}`);
};

// --- ADDITION START ---
export const sendWelcomeEmail = (interviewerId) => {
    return api.post(`/api/admin/interviewers/${interviewerId}/send-welcome-email`);
};

export const sendProbationEmail = (interviewerId) => {
    return api.post(`/api/admin/interviewers/${interviewerId}/send-probation-email`);
};
// --- ADDITION END ---

export const markProbationAsSent = (interviewerId) => {
    return api.post(`/api/admin/interviewers/${interviewerId}/mark-probation-sent`);
};

export const bulkDeleteInterviewers = (ids) => {
    // Axios DELETE requests with a body need to be wrapped in a 'data' object
    return api.delete('/api/admin/interviewers/bulk', { data: { ids } });
};


// --- Users ---
export const getUsers = (params) => {
    return api.get('/api/admin/users', { params });
};
export const getUserDetails = (id) => {
    return api.get(`/api/admin/users/${id}`);
};
export const createUser = (data) => {
    return api.post('/api/admin/users', data);
};
export const updateUser = (id, data) => {
    return api.put(`/api/admin/users/${id}`, data);
};
export const deleteUser = (id) => {
    return api.delete(`/api/admin/users/${id}`);
};

// --- Notification Settings ---
export const getNotificationSettings = () => api.get('/api/admin/notification-settings');
export const updateNotificationSettings = (data) => api.put('/api/admin/notification-settings', data);

// --- Stats & Reports ---
export const getDashboardStats = (params) => {
    return api.get('/api/admin/stats/dashboard', { params });
};
export const getDashboardAnalytics = (params) => {
  return api.get('/api/admin/stats/analytics', { params });
};
export const getLatestInterviewDate = () => {
    return api.get('/api/admin/stats/latest-interview-date');
};
export const getPayoutSheet = (params) => {
    return api.get('/api/admin/earnings-report', { params });
};
export const getPaymentRequests = (params) => {
    return api.get('/api/admin/payment-requests', { params });
};
export const sendPaymentEmail = (data) => {
    return api.post('/api/admin/payment-requests/send-email', data);
};
export const sendInvoiceEmail = (data) => {
    return api.post('/api/admin/payment-requests/send-invoice-mail', data);
};

export const sendPaymentReceivedEmail = (data) => {
    return api.post('/api/admin/payment-requests/send-received-mail', data);
};

export const saveBonusAmount = (data) => {
    return api.post('/api/admin/payment-requests/bonus', data);
  };

// --- INTERVIEWER BOOKING APIS ---
export const createInterviewBooking = (data) => {
    return api.post('/api/admin/bookings', data);
};
export const getInterviewBookings = () => {
    return api.get('/api/admin/bookings');
};
export const getInterviewBookingDetails = (id) => { 
    return api.get(`/api/admin/bookings/${id}`);
};
export const getBookingSlots = (params) => {
    return api.get('/api/admin/booking-slots', { params });
};
export const manualAddBookingSlot = (data) => {
    return api.post('/api/admin/booking-slots/manual', data);
};
export const updateInterviewBooking = (id, data) => {
    return api.put(`/api/admin/bookings/${id}`, data);
};
export const deleteInterviewBooking = (id) => {
    return api.delete(`/api/admin/bookings/${id}`);
};
export const resetBookingSubmission = (bookingId, submissionId) => { 
    return api.delete(`/api/admin/bookings/${bookingId}/submissions/${submissionId}`);
};

// --- Bulk Upload APIs ---
export const bulkUploadMainSheetEntries = (data) => {
    return api.post('/api/admin/main-sheet/bulk-upload', data);
};
export const bulkUploadInterviewers = (data) => {
    return api.post('/api/admin/interviewers/bulk-upload', data);
};


// --- MAIN SHEET APIS ---
export const getMainSheetEntries = (params) => {
    return api.get('/api/admin/main-sheet', { params });
};
export const getMainSheetEntry = (id) => {
    return api.get(`/api/admin/main-sheet/${id}`); 
};
export const bulkUpdateMainSheetEntries = (entries) => {
    return api.post('/api/admin/main-sheet/bulk', entries);
};
export const deleteMainSheetEntry = (id) => {
    return api.delete(`/api/admin/main-sheet/${id}`);
};
export const bulkDeleteMainSheetEntries = (ids) => {
    return api.delete('/api/admin/main-sheet/bulk', { data: { ids } });
};
export const exportMainSheet = (params) => {
    return api.get('/api/admin/main-sheet/export', { params, responseType: 'blob' });
};
export const getUniqueHiringNames = () => {
    return api.get('/api/admin/main-sheet/hiring-names');
};
export const refreshRecordingLinks = () => {
    return api.post('/api/admin/main-sheet/refresh-recordings');
};


// ** STUDENT BOOKING SYSTEM APIs **
export const createPublicBookingLink = (data) => {
    return api.post('/api/admin/public-bookings', data);
};
export const getPublicBookings = () => {
    return api.get('/api/admin/public-bookings');
};
export const updatePublicBookingLink = (id, data) => {
    return api.put(`/api/admin/public-bookings/${id}`, data);
};
export const getPublicBookingDetails = (id) => {
    return api.get(`/api/admin/public-bookings/${id}`);
};
export const sendBookingReminders = (id) => {
    return api.post(`/api/admin/public-bookings/${id}/reminders`);
};
export const getStudentPipeline = () => {
    return api.get('/api/admin/student-bookings/pipeline');
};
export const updateStudentBooking = (id, data) => {
    return api.put(`/api/admin/student-bookings/${id}`, data);
};
export const getUniqueHostEmails = () => {
    return api.get('/api/admin/student-bookings/host-emails');
};
export const generateGoogleMeetLink = (id) => {
    return api.post(`/api/admin/student-bookings/${id}/generate-meet`);
};

export const deletePublicBookingLink = (id) => {
    return api.delete(`/api/admin/public-bookings/${id}`);
};

export const manualBookStudentSlot = (studentEmailId, data) => {
    return api.post(`/api/admin/student-bookings/${studentEmailId}/manual-book`, data);
};

// *** Domain & Evaluation Sheet APIs ***
export const getDomains = () => {
    return api.get('/api/admin/domains');
};
export const createDomain = (data) => {
    return api.post('/api/admin/domains', data);
};
export const updateDomain = (id, data) => {
    return api.put(`/api/admin/domains/${id}`, data);
};
export const deleteDomain = (id) => {
    return api.delete(`/api/admin/domains/${id}`);
};
export const getEvaluationSheet = (domainId) => {
    return api.get(`/api/admin/evaluation-sheet/${domainId}`);
};
export const updateEvaluationSheet = (domainId, data) => {
    return api.put(`/api/admin/evaluation-sheet/${domainId}`, data);
};

// --- Custom Email APIs ---
export const getCustomEmailTemplates = () => {
    return api.get('/api/admin/custom-email-templates');
};
export const createCustomEmailTemplate = (data) => {
    return api.post('/api/admin/custom-email-templates', data);
};
export const updateCustomEmailTemplate = (id, data) => {
    return api.put(`/api/admin/custom-email-templates/${id}`, data);
};
export const deleteCustomEmailTemplate = (id) => {
    return api.delete(`/api/admin/custom-email-templates/${id}`);
};
export const sendBulkCustomEmail = (data) => {
    return api.post('/api/admin/custom-email/send', data);
};
export const updateInterviewBookingStatus = (id, status) => {
    return api.put(`/api/admin/bookings/${id}/status`, { status });
};
