const mongoose = require('mongoose');

const AppSettingSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: ['sourcing_channels', 'proficiency_levels', 'payment_tiers', 'tech_stacks', 'interview_statuses'],
    index: true,
  },
  value: { type: String, required: true, trim: true },
  label: { type: String, required: true, trim: true },
  amount: { type: Number }, // only for payment_tiers
  sortOrder: { type: Number, default: 0 },
}, { timestamps: true });

AppSettingSchema.index({ category: 1, value: 1 }, { unique: true });

module.exports = mongoose.model('AppSetting', AppSettingSchema);
