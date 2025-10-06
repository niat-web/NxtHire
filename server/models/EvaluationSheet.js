// server/models/EvaluationSheet.js
const mongoose = require('mongoose');

const OptionSchema = new mongoose.Schema({
    label: { 
        type: String, 
        required: true 
    },
    value: { 
        type: String, 
        required: true 
    },
});

const ColumnSchema = new mongoose.Schema({
    header: { 
        type: String, 
        trim: true, 
        default: '' 
    },
    // --- ADDED: 'type' field to distinguish parameter types ---
    type: {
        type: String,
        enum: ['select', 'text'],
        default: 'select'
    },
    options: [OptionSchema]
});

const ColumnGroupSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true, 
        trim: true 
    },
    columns: [ColumnSchema]
});

const EvaluationSheetSchema = new mongoose.Schema({
  domain: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Domain',
    required: true,
    unique: true,
    index: true
  },
  columnGroups: [ColumnGroupSchema],
  remarksEnabled: {
    type: Boolean,
    default: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('EvaluationSheet', EvaluationSheetSchema);
