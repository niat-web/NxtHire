// server/models/MainSheetEntry.js
const mongoose = require('mongoose');

const MainSheetEntrySchema = new mongoose.Schema({
    hiringName: { type: String, trim: true, default: '' },
    techStack: { 
        type: String, 
        trim: true, 
        default: '',
        enum: [
            'MERN', 'Python', 'React', 'Domain Expert', 'Python+SQL', 'MERN+Node', 
            'Java + SQL', 'JavaScript & C++', 'May Edition', 'ATCD MERN TR-1', 
            'MERN+NextJS', 'ATCD DSA TR-1', 'ATCD - React Project', 'College Plus', 
            'TCD DSA TR-1', 'TCD MERN TR-1', 'June Edition', 'Java+Spring', 
            'NIAT - React', 'TCD - React Project', ''
        ]
    },
    interviewId: { type: String, trim: true, unique: true, sparse: true },
    uid: { type: String, trim: true, default: '' },
    candidateName: { type: String, required: true, trim: true },
    mobileNumber: { type: String, trim: true, default: '' },
    mailId: { type: String, required: true, trim: true, lowercase: true },
    candidateResume: { type: String, trim: true, default: '' },
    meetingLink: { type: String, trim: true, default: '' },
    interviewDate: { type: Date },
    interviewTime: { type: String, trim: true, default: '' },
    interviewDuration: { type: String, trim: true, default: '' },
    interviewStatus: {
        type: String,
        enum: ['Completed', 'Scheduled', 'InProgress', 'Cancelled', ''],
        default: 'Scheduled'
    },
    remarks: { type: String, trim: true, default: '' },
    interviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Interviewer'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

// ** FIX: REMOVED Auto-generation logic for interviewId to allow for manual input **

module.exports = mongoose.model('MainSheetEntry', MainSheetEntrySchema);