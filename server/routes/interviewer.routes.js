// server/routes/interviewer.routes.js
const express = require('express');
const { 
  getProfile, 
  updateProfile,
  getMetrics, 
  updateBankDetails,
  // New booking routes
  getBookingRequests,
  submitTimeSlots,
} = require('../controllers/interviewer.controller');
const { protect, interviewerOnly } = require('../middleware/auth.middleware');
const { validate, schemas } = require('../middleware/validator.middleware');

const router = express.Router();

router.use(protect);
router.use(interviewerOnly);

// Profile management
router.get('/profile', getProfile);
router.put('/profile', updateProfile); // Note: Simplified validation schema in this file
router.put('/bank-details', updateBankDetails);

// Availability & Booking Requests
router.get('/booking-requests', getBookingRequests);
router.post('/booking-requests/:bookingId/slots', submitTimeSlots);

// Metrics
router.get('/metrics', getMetrics);

module.exports = router;