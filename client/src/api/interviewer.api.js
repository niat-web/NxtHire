// client/src/api/interviewer.api.js
import api from './axios';

export const getProfile = () => {
  return api.get('/api/interviewer/profile');
};

export const updateProfile = (data) => {
  return api.put('/api/interviewer/profile', data);
};

export const getMetrics = () => {
  return api.get('/api/interviewer/metrics');
};

export const updateBankDetails = (data) => {
  return api.put('/api/interviewer/bank-details', data);
};

// --- NEW BOOKING REQUEST APIS ---
export const getBookingRequests = () => {
  return api.get('/api/interviewer/booking-requests');
};

export const submitTimeSlots = (bookingId, data) => {
  return api.post(`/api/interviewer/booking-requests/${bookingId}/slots`, data);
};