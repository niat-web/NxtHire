// server/models/Interviewer.js
const mongoose = require('mongoose');
const crypto = require('crypto');

const ExperienceSchema = new mongoose.Schema({
    title: { type: String, required: true },
    company: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    isPresent: { type: Boolean, default: false },
    description: { type: String, trim: true },
    skills: [{ type: String, trim: true }]
});


const InterviewerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  interviewerId: {
    type: String,
    required: true,
    unique: true,
    default: () => crypto.randomUUID(),
    index: true,
  },
  payoutId: {
    type: String,
    trim: true,
    unique: true,
    sparse: true, 
  },
  probationEmailSentAt: {
    type: Date,
    default: null,
  },
  welcomeEmailSentAt: {
    type: Date,
    default: null,
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Applicant',
    required: true
  },
  currentEmployer: {
    type: String,
    trim: true
  },
  jobTitle: {
    type: String,
    trim: true
  },
  yearsOfExperience: {
    type: Number,
    default: 0,
    min: 0
  },
  companyType: {
    type: String,
    enum: ['Product-based', 'Service-based', 'Startup', 'Other'],
    default: 'Other'
  },
  domains: [{
    type: String,
    enum: [
      'MERN', 
      'JAVA', 
      'PYTHON', 
      'DA', 
      'QA',
      'DSA',
      'OTHER'
    ],
    required: true
  }],
  skills: [{
    skill: {
      type: String,
      required: true
    },
    proficiencyLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      required: true
    }
  }],
  experiences: [ExperienceSchema],
  status: {
    type: String,
    enum: ['On Probation', 'Active', 'Inactive', 'Suspended', 'Terminated'],
    default: 'On Probation'
  },
  paymentAmount: {
    type: String,
    trim: true,
    default: ''
  },
  bankDetails: {
    accountName: {
      type: String,
      trim: true
    },
    accountNumber: {
      type: String,
      trim: true
    },
    bankName: {
      type: String,
      trim: true
    },
    ifscCode: {
      type: String,
      trim: true
    }
  },
  pushSubscriptions: [mongoose.Schema.Types.Mixed],
  metrics: {
    interviewsCompleted: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    completionRate: {
      type: Number,
      default: 100,
      min: 0,
      max: 100
    },
    cancellationRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    totalEarnings: {
      type: Number,
      default: 0
    }
  },
  onboardingDate: {
    type: Date,
    default: Date.now
  },
  probationEndDate: {
    type: Date,
    default: function() {
      const date = new Date(this.onboardingDate);
      date.setMonth(date.getMonth() + 1);
      return date;
    }
  },
  profileCompleteness: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
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

InterviewerSchema.pre('save', function(next) {
  let completeness = 0;
  const totalFields = 7;
  
  if (this.user) completeness += 1;
  if (this.domains && this.domains.length > 0) completeness += 1;
  if (this.primaryDomain) completeness += 1;
  if (this.skills && this.skills.length > 0) completeness += 1;
  if (this.bankDetails && this.bankDetails.accountNumber) completeness += 1;
  if (this.currentEmployer) completeness += 1;
  if (this.jobTitle) completeness += 1;
  
  this.profileCompleteness = Math.round((completeness / totalFields) * 100);
  next();
});

module.exports = mongoose.model('Interviewer', InterviewerSchema);
