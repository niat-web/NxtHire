// server/models/Availability.js
const mongoose = require('mongoose');

const AvailabilitySchema = new mongoose.Schema({
  interviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Interviewer',
    required: true
  },
  // For recurring weekly availability
  recurringSlots: [{
    dayOfWeek: {
      type: Number,
      required: true,
      min: 0, // Sunday
      max: 6  // Saturday
    },
    startTime: {
      type: String,
      required: true,
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Please provide time in HH:MM format']
    },
    endTime: {
      type: String,
      required: true,
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Please provide time in HH:MM format']
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  // For specific date-time slots
  specificSlots: [{
    date: {
      type: Date,
      required: true
    },
    startTime: {
      type: String,
      required: true,
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Please provide time in HH:MM format']
    },
    endTime: {
      type: String,
      required: true,
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Please provide time in HH:MM format']
    },
    isBooked: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  timezone: {
    type: String,
    default: 'Asia/Kolkata' // Default to IST
  },
  availabilityNotes: {
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

// Validation to ensure start time is before end time
const validateTimeRange = function(slots) {
  if (!slots || !slots.length) return true;
  
  for (const slot of slots) {
    const start = slot.startTime.split(':');
    const end = slot.endTime.split(':');
    
    const startHour = parseInt(start[0]);
    const startMinute = parseInt(start[1]);
    const endHour = parseInt(end[0]);
    const endMinute = parseInt(end[1]);
    
    if (startHour > endHour || (startHour === endHour && startMinute >= endMinute)) {
      return false;
    }
  }
  
  return true;
};

// Apply validation before saving
AvailabilitySchema.pre('save', function(next) {
  if (this.isModified('recurringSlots') && !validateTimeRange(this.recurringSlots)) {
    return next(new Error('Start time must be before end time for recurring slots'));
  }
  
  if (this.isModified('specificSlots') && !validateTimeRange(this.specificSlots)) {
    return next(new Error('Start time must be before end time for specific slots'));
  }
  
  next();
});

module.exports = mongoose.model('Availability', AvailabilitySchema);