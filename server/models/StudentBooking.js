// server/models/StudentBooking.js
const mongoose = require('mongoose');

const StudentBookingSchema = new mongoose.Schema({
    publicBooking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PublicBooking',
        required: true
    },
    studentName: {
        type: String,
        required: true,
        trim: true
    },
    studentEmail: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    studentPhone: {
        type: String,
        required: true,
        trim: true
    },
    bookedInterviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Interviewer',
        required: true
    },
    bookedSlot: {
        startTime: { type: String, required: true },
        endTime: { type: String, required: true }
    },
    bookingDate: {
        type: Date,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('StudentBooking', StudentBookingSchema);