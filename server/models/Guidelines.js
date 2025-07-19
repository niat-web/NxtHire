// server/models/Guidelines.js
const mongoose = require('mongoose');

const GuidelinesSchema = new mongoose.Schema({
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Applicant',
    required: true
  },
  answers: [{
    questionNumber: {
      type: Number,
      required: true,
      min: 1
    },
    selectedOption: {
      type: String,
      required: true
    },
    isCorrect: {
      type: Boolean,
      required: true
    }
  }],
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  passed: {
    type: Boolean,
    default: false
  },
  completionTime: {
    type: Number, // in seconds
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Calculate score and pass/fail status before saving
GuidelinesSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('answers')) {
    const correctAnswers = this.answers.filter(answer => answer.isCorrect).length;
    const totalQuestions = this.answers.length;
    
    this.score = Math.round((correctAnswers / totalQuestions) * 100);
    this.passed = this.score >= 80; // 80% is passing score
  }
  next();
});

module.exports = mongoose.model('Guidelines', GuidelinesSchema);