const mongoose = require('mongoose');

const DomainOptionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Domain name is required'],
    unique: true,
    trim: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('DomainOption', DomainOptionSchema);
