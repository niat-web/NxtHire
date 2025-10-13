// server/models/Communication.js
const mongoose = require('mongoose');

const CommunicationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'recipientModel',
    required: true
  },
  recipientModel: {
    type: String,
    required: true,
    enum: ['Applicant', 'Interviewer', 'PublicBooking', 'Custom', 'User']
  },
  recipientEmail: {
    type: String,
    required: true
  },
  recipientPhone: {
    type: String
  },
  communicationType: {
    type: String,
    enum: ['Email', 'WhatsApp', 'SMS'],
    required: true
  },
  templateName: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: function() {
      return this.communicationType === 'Email';
    }
  },
  content: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Queued', 'Sent', 'Delivered', 'Failed', 'Read'],
    default: 'Queued'
  },
  relatedTo: {
    type: String,
    enum: [
      'Application Confirmation',
      'LinkedIn Review',
      'Skill Assessment',
      'Guidelines',
      'Onboarding',
      'Account Creation',
      'Password Reset',
      'Interview Reminder',
      'System Notification',
      'Student Booking',
      'Student Booking Reminder',
      'Payment Request',
      'Payment Invoice',
      'Payment Received Confirmation',
      'Interviewer Booking', // --- FIX: Add this line ---
      'Interview Cancellation',
      'Other'
    ],
    required: true
  },
  sentBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isAutomated: {
    type: Boolean,
    default: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  statusLog: [{
    status: {
      type: String,
      enum: ['Queued', 'Sent', 'Delivered', 'Failed', 'Read']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  sentAt: Date
}, {
  timestamps: true
});

// Add the current status to status log before saving
CommunicationSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.statusLog.push({
      status: this.status,
      timestamp: Date.now()
    });
    
    if (this.status === 'Sent' && !this.sentAt) {
      this.sentAt = Date.now();
    }
  }
  next();
});

module.exports = mongoose.model('Communication', CommunicationSchema);
