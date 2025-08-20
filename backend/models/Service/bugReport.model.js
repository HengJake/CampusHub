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
