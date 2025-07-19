// server/models/Admin.js
const mongoose = require('mongoose');
const User = require('./User');

const AdminSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  department: {
    type: String,
    enum: ['HR', 'Technical', 'Operations', 'Management'],
    default: 'HR'
  },
  permissions: {
    manageApplicants: {
      type: Boolean,
      default: true
    },
    manageInterviewers: {
      type: Boolean,
      default: true
    },
    manageCommunications: {
      type: Boolean,
      default: true
    },
    viewReports: {
      type: Boolean,
      default: true
    },
    systemSettings: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Admin', AdminSchema);