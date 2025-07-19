// server/models/PublicBooking.js
const mongoose = require('mongoose');
const { nanoid } = require('nanoid');

const PublicBookingSchema = new mongoose.Schema({
    publicId: {
        type: String,
        default: () => nanoid(12), // Use nanoid directly with a specified length
        unique: true,
        index: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // The specific slots made available for this booking page
    interviewerSlots: [{
        interviewer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Interviewer',
            required: true
        },
        date: {
            type: Date,
            required: true
        },
        timeSlots: [{
            startTime: { type: String, required: true },
            endTime: { type: String, required: true },
            // This will link to the StudentBooking record once a slot is taken
            bookedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'StudentBooking',
                default: null
            }
        }]
    }],
    // The list of students who are allowed to book using this link
    allowedEmails: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    status: {
        type: String,
        enum: ['Active', 'Closed', 'Archived'],
        default: 'Active'
    }
}, { timestamps: true });

module.exports = mongoose.model('PublicBooking', PublicBookingSchema);