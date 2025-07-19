// client/src/api/public.api.js
import api from './axios'; // The public routes don't use the interceptor for auth

// Verify email for a public booking page
export const verifyPublicBookingEmail = (data) => {
    return api.post('/api/public-bookings/verify-email', data);
};

// Get available slots for a public booking page
export const getPublicAvailableSlots = (publicId) => {
    return api.get(`/api/public-bookings/${publicId}/slots`);
};

// Book a slot on a public booking page
export const bookPublicSlot = (publicId, data) => {
    return api.post(`/api/public-bookings/${publicId}/book`, data);
};