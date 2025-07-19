// server/controllers/interviewer.controller.js
const asyncHandler = require('express-async-handler');
const Interviewer = require('../models/Interviewer');
const User = require('../models/User');
const Availability = require('../models/Availability');
const InterviewBooking = require('../models/InterviewBooking'); // New model
const { logEvent, logError } = require('../middleware/logger.middleware');

// @desc    Get interviewer profile
// @route   GET /api/interviewer/profile
// @access  Private/Interviewer
const getProfile = asyncHandler(async (req, res) => {
  const interviewer = await Interviewer.findOne({ user: req.user.id })
    .populate('user', 'firstName lastName email phoneNumber whatsappNumber');
  if (!interviewer) {
    res.status(404);
    throw new Error('Interviewer profile not found');
  }
  res.json({ success: true, data: interviewer });
});

// @desc    Update interviewer profile
// @route   PUT /api/interviewer/profile
// @access  Private/Interviewer
const updateProfile = asyncHandler(async (req, res) => {
  const { currentEmployer, jobTitle } = req.body;
  const interviewer = await Interviewer.findOne({ user: req.user.id });
  if (!interviewer) {
    res.status(404); throw new Error('Interviewer profile not found');
  }
  if (currentEmployer) interviewer.currentEmployer = currentEmployer;
  if (jobTitle) interviewer.jobTitle = jobTitle;
  await interviewer.save();
  logEvent('interviewer_profile_updated', { interviewerId: interviewer._id, userId: req.user.id });
  res.json({ success: true, data: interviewer, message: 'Profile updated successfully' });
});

// @desc    Update bank details
// @route   PUT /api/interviewer/bank-details
// @access  Private/Interviewer
const updateBankDetails = asyncHandler(async (req, res) => {
  const { accountName, accountNumber, bankName, ifscCode } = req.body;
  if (!accountName || !accountNumber || !bankName || !ifscCode) {
    res.status(400);
    throw new Error('All bank details fields are required');
  }
  const interviewer = await Interviewer.findOne({ user: req.user.id });
  if (!interviewer) {
    res.status(404); throw new Error('Interviewer profile not found');
  }
  interviewer.bankDetails = { accountName, accountNumber, bankName, ifscCode };
  await interviewer.save();
  logEvent('interviewer_bank_details_updated', { interviewerId: interviewer._id, userId: req.user.id });
  res.json({ success: true, message: 'Bank details updated successfully' });
});

// @desc    Get interviewer metrics/stats
// @route   GET /api/interviewer/metrics
// @access  Private/Interviewer
const getMetrics = asyncHandler(async (req, res) => {
  const interviewer = await Interviewer.findOne({ user: req.user.id });
  if (!interviewer) {
    res.status(404);
    throw new Error('Interviewer profile not found');
  }
  res.json({
    success: true,
    data: {
      metrics: interviewer.metrics,
      status: interviewer.status,
      paymentTier: interviewer.paymentTier,
      profileCompleteness: interviewer.profileCompleteness,
    },
  });
});


// --- NEW CONTROLLERS FOR BOOKING REQUESTS ---

// @desc    Get booking requests for the logged-in interviewer
// @route   GET /api/interviewer/booking-requests
// @access  Private/Interviewer
const getBookingRequests = asyncHandler(async (req, res) => {
    const interviewer = await Interviewer.findOne({ user: req.user.id }).select('_id');
    if (!interviewer) {
        res.status(404);
        throw new Error('Interviewer profile not found');
    }

    const requests = await InterviewBooking.find({
        'interviewers.interviewer': interviewer._id,
        status: 'Open'
    })
    .select('bookingDate interviewers status')
    .sort({ bookingDate: -1 });

    // Filter to only return the specific sub-document for the current user
    const personalRequests = requests.map(booking => {
        const myRequest = booking.interviewers.find(
            i => i.interviewer.toString() === interviewer._id.toString()
        );
        return {
            bookingId: booking._id,
            bookingDate: booking.bookingDate,
            status: myRequest.status,
            providedSlots: myRequest.providedSlots,
        };
    });
    
    res.json({ success: true, data: personalRequests });
});

// @desc    Submit time slots for a specific booking request
// @route   POST /api/interviewer/booking-requests/:bookingId/slots
// @access  Private/Interviewer
const submitTimeSlots = asyncHandler(async (req, res) => {
    const { slots } = req.body;
    const { bookingId } = req.params;
    
    const interviewer = await Interviewer.findOne({ user: req.user.id }).select('_id');
    if (!interviewer) {
        res.status(404);
        throw new Error('Interviewer profile not found');
    }
    
    const booking = await InterviewBooking.findById(bookingId);
    if (!booking) {
        res.status(404);
        throw new Error('Booking request not found.');
    }

    const interviewerSubDoc = booking.interviewers.find(i => i.interviewer.toString() === interviewer._id.toString());
    if (!interviewerSubDoc) {
        res.status(403);
        throw new Error('You are not part of this booking request.');
    }

    interviewerSubDoc.providedSlots = slots;
    interviewerSubDoc.status = 'Submitted';
    interviewerSubDoc.submittedAt = new Date();
    
    await booking.save();

    logEvent('interviewer_slots_submitted', {
        bookingId: booking._id,
        interviewerId: interviewer._id,
    });
    
    res.json({ success: true, message: 'Time slots submitted successfully.' });
});

module.exports = {
  getProfile,
  updateProfile,
  updateBankDetails,
  getMetrics,
  getBookingRequests, // New
  submitTimeSlots,    // New
};