// server/controllers/public.controller.js
const asyncHandler = require('express-async-handler');
const PublicBooking = require('../models/PublicBooking');
const StudentBooking = require('../models/StudentBooking');
const mongoose = require('mongoose');

// @desc    Verify if a student's email is allowed to book a slot
// @route   POST /api/public-bookings/verify-email
// @access  Public
const verifyEmail = asyncHandler(async (req, res) => {
    const { email, publicId } = req.body;

    const bookingPage = await PublicBooking.findOne({ publicId, status: 'Active' });
    if (!bookingPage) {
        res.status(404);
        throw new Error("This booking page is not available or could not be found.");
    }

    if (!bookingPage.allowedEmails.includes(email.toLowerCase())) {
        res.status(403);
        throw new Error("This email is not authorized to book a slot for this event.");
    }

    // Check if this student has already booked
    const existingBooking = await StudentBooking.findOne({ studentEmail: email.toLowerCase(), publicBooking: bookingPage._id });
    if (existingBooking) {
        return res.json({
            success: true,
            status: 'already_booked',
            booking: existingBooking
        });
    }

    res.json({ success: true, status: 'authorized' });
});

// @desc    Get available slots for a public booking page
// @route   GET /api/public-bookings/:publicId/slots
// @access  Public
const getAvailableSlots = asyncHandler(async (req, res) => {
    const { publicId } = req.params;
    const bookingPage = await PublicBooking.findOne({ publicId }).populate('interviewerSlots.interviewer', 'user').populate({
        path: 'interviewerSlots.interviewer',
        populate: { path: 'user', select: 'firstName lastName' }
    });

    if (!bookingPage) {
        res.status(404);
        throw new Error("Booking page not found.");
    }
    
    // Filter out any booked slots
    const availableSlots = bookingPage.interviewerSlots.map(interviewerSlot => ({
        ...interviewerSlot.toObject(),
        timeSlots: interviewerSlot.timeSlots.filter(slot => !slot.bookedBy)
    })).filter(interviewerSlot => interviewerSlot.timeSlots.length > 0); // Only include interviewers who still have slots

    res.json({ success: true, data: availableSlots });
});


// @desc    Book a time slot
// @route   POST /api/public-bookings/:publicId/book
// @access  Public
const bookSlot = asyncHandler(async (req, res) => {
    const { publicId } = req.params;
    const { studentName, studentEmail, studentPhone, interviewerId, slot } = req.body;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const bookingPage = await PublicBooking.findOne({ publicId }).session(session);
        if (!bookingPage) {
            res.status(404);
            throw new Error("Booking page not found.");
        }
        
        // Find the specific slot
        const interviewerSlot = bookingPage.interviewerSlots.find(is => is.interviewer.toString() === interviewerId);
        const timeSlot = interviewerSlot?.timeSlots.find(ts => ts.startTime === slot.startTime && ts.endTime === slot.endTime);
        
        // **Critical Check**: Is the slot still available?
        if (!timeSlot || timeSlot.bookedBy) {
            await session.abortTransaction();
            res.status(409); // Conflict
            throw new Error("Sorry, this time slot has just been booked by someone else. Please select another.");
        }

        const newStudentBooking = new StudentBooking({
            publicBooking: bookingPage._id,
            studentName,
            studentEmail,
            studentPhone,
            bookedInterviewer: interviewerId,
            bookedSlot: { startTime: slot.startTime, endTime: slot.endTime },
            bookingDate: interviewerSlot.date,
        });

        await newStudentBooking.save({ session });

        // Update the PublicBooking to mark the slot as taken
        timeSlot.bookedBy = newStudentBooking._id;
        await bookingPage.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({ success: true, message: "Your interview slot has been confirmed!", data: newStudentBooking });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error; // Let the global error handler manage it
    }
});

module.exports = { verifyEmail, getAvailableSlots, bookSlot };