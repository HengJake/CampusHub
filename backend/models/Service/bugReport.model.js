// Programmer Name : Ritchie Boon Win Yew, Backend Developer
// Program Name: bugReport.model.js
// Description: BugReport model schema defining software issue reporting, bug tracking, and resolution workflow management
// First Written on: July 10, 2024
// Edited on: Friday, July 10, 2024

import mongoose from 'mongoose';

const bugReportSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    image: {
        type: String, // URL or base64 string of the screenshot
        required: true
    },
    consoleLogMessage: {
        type: String,
        required: true
    },
    errorFile: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['reported', 'investigating', 'fixing', 'resolved', 'closed'],
        default: 'reported'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Medium'
    },
    description: {
        type: String,
        required: false
    },
    resolution: {
        type: String,
        required: false
    },
    resolvedAt: {
        type: Date,
        required: false
    }
}, {
    timestamps: true
});

const BugReport = mongoose.model('BugReport', bugReportSchema);
export default BugReport;
