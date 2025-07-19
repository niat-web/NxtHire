// server/models/InterviewBooking.js
const mongoose = require('mongoose');

const InterviewerSlotSchema = new mongoose.Schema({
  interviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Interviewer',
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Submitted'],
    default: 'Pending'
  },
  providedSlots: [{
    startTime: { type: String, required: true },
    endTime: { type: String, required: true }
  }],
  submittedAt: {
    type: Date
  }
});

const InterviewBookingSchema = new mongoose.Schema({
  bookingDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Open', 'Closed'],
    default: 'Open'
  },
  interviewers: [InterviewerSlotSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('InterviewBooking', InterviewBookingSchema);