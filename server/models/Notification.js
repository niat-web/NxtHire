const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['interviewer_submitted_slots', 'student_booked_slot', 'meet_link_generated', 'new_applicant', 'payment_confirmed'],
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
  isRead: { type: Boolean, default: false },
  // Target audience — 'admin' for now, extensible later
  targetRole: { type: String, default: 'admin', enum: ['admin', 'interviewer'] },
}, { timestamps: true });

notificationSchema.index({ targetRole: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
