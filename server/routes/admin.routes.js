// server/routes/admin.routes.js
const express = require('express');
const { 
  getDashboardStats, getApplicants, createApplicant, getApplicantDetails,
  updateApplicant, deleteApplicant, exportApplicants, processLinkedInReview, 
  processSkillCategorization, manualOnboard, updateApplicantStatus,
  getSkillAssessments, getGuidelinesSubmissions, processGuidelinesReview,
  getInterviewers, getInterviewerDetails, createInterviewer, updateInterviewer,
  deleteInterviewer, getUsers, getUserDetails, createUser, updateUser, deleteUser,
  createInterviewBooking, getInterviewBookings, getBookingSlots,
  getInterviewBookingDetails,
  resetBookingSubmission,
  updateInterviewBooking,
  deleteInterviewBooking,
  // Main Sheet Imports
  getMainSheetEntryById,
  getMainSheetEntries,
  bulkUpdateMainSheetEntries,
  deleteMainSheetEntry,
  bulkDeleteMainSheetEntries,
  // Public Booking Imports
  createPublicBooking,
  getPublicBookings,
  updatePublicBooking,
  getStudentBookings,
  getPublicBookingDetails,
} = require('../controllers/admin.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');
const { validate, schemas } = require('../middleware/validator.middleware');

const router = express.Router();

router.use(protect);
router.use(adminOnly);

// Dashboard stats
router.get('/stats/dashboard', getDashboardStats);

// Applicant management
router.route('/applicants').get(getApplicants).post(createApplicant);
router.get('/applicants/export', exportApplicants);
router.route('/applicants/:id').get(getApplicantDetails).put(updateApplicant).delete(deleteApplicant);
router.post('/applicants/:id/linkedin-review', validate(schemas.linkedInReview), processLinkedInReview);
router.post('/applicants/:id/manual-onboard', validate(schemas.manualOnboard), manualOnboard);
router.put('/applicants/:id/status', updateApplicantStatus);

// Skill assessment review
router.get('/skill-assessments', getSkillAssessments);
router.post('/skill-assessments/:id/categorize', validate(schemas.skillCategorization), processSkillCategorization);

// Guidelines Submissions
router.get('/guidelines', getGuidelinesSubmissions);
router.post('/guidelines/:id/review', processGuidelinesReview);

// Interviewer Management
router.route('/interviewers').get(getInterviewers).post(createInterviewer);
router.route('/interviewers/:id').get(getInterviewerDetails).put(updateInterviewer).delete(deleteInterviewer);

// User Management
router.route('/users').get(getUsers).post(createUser);
router.route('/users/:id').get(getUserDetails).put(updateUser).delete(deleteUser);

// Interview Booking Management
router.route('/bookings').get(getInterviewBookings).post(createInterviewBooking);
router.route('/bookings/:id').get(getInterviewBookingDetails).put(updateInterviewBooking).delete(deleteInterviewBooking);
router.delete('/bookings/:bookingId/submissions/:submissionId', resetBookingSubmission);
router.get('/booking-slots', getBookingSlots);

// Main Sheet Routes
router.route('/main-sheet').get(getMainSheetEntries);
router.route('/main-sheet/bulk').post(bulkUpdateMainSheetEntries).delete(bulkDeleteMainSheetEntries);
router.route('/main-sheet/:id').get(getMainSheetEntryById).delete(deleteMainSheetEntry); 

// Student Booking System Routes
router.route('/public-bookings').get(getPublicBookings).post(createPublicBooking);
router.route('/public-bookings/:id').get(getPublicBookingDetails).put(updatePublicBooking);
router.get('/student-bookings', getStudentBookings);

module.exports = router;