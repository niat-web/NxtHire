// server/models/Applicant.js
const mongoose = require('mongoose');

const ApplicantSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please provide a valid email']
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  whatsappNumber: {
    type: String,
    trim: true
  },
  linkedinProfileUrl: {
    type: String,
    required: [true, 'LinkedIn profile URL is required'],
    trim: true
  },
  interestedInJoining: {
    type: Boolean,
    default: true
  },
  sourcingChannel: {
    type: String,
    enum: ['LinkedIn', 'Referral', 'Job Portal', 'Website', 'Other'],
    required: [true, 'Source of application is required']
  },
  additionalComments: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: [
      'Application Submitted',
      'Under Review',
      'Profile Approved',
      'Profile Rejected',
      'Skills Assessment Sent',
      'Skills Assessment Completed',
      'Guidelines Sent',
      'Guidelines Reviewed',
      'Guidelines Failed',
      'Onboarded',
      'Active Interviewer',
      'Time Slots Confirmed'
    ],
    default: 'Application Submitted'
  },
  statusHistory: [{
    status: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String
  }],
  reviewNotes: {
    type: String,
    trim: true
  },
  interviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Interviewer'
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add the current status to status history before saving
ApplicantSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      timestamp: Date.now()
    });
  }
  next();
});

module.exports = mongoose.model('Applicant', ApplicantSchema);