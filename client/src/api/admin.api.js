// client/src/api/admin.api.js
import api from './axios';

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

// --- Stats ---
export const getDashboardStats = (params) => {
    return api.get('/api/admin/stats/dashboard', { params });
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
export const updateInterviewBooking = (id, data) => {
    return api.put(`/api/admin/bookings/${id}`, data);
};
export const deleteInterviewBooking = (id) => {
    return api.delete(`/api/admin/bookings/${id}`);
};
export const resetBookingSubmission = (bookingId, submissionId) => { 
    return api.delete(`/api/admin/bookings/${bookingId}/submissions/${submissionId}`);
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
export const getConfirmedStudentBookings = () => {
    return api.get('/api/admin/student-bookings');
};