// Programmer Name : Heng Jun Kai, Project Manager, Leader Full Stack developer
// Program Name: attendance.model.js
// Description: Attendance model schema defining student class attendance tracking, absence records, and attendance statistics
// First Written on: July 10, 2024
// Edited on: Friday, July 10, 2024

import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },

    scheduleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ClassSchedule',
        required: true
    },

    status: {
        type: String,
        enum: ['present', 'absent', 'late', 'excused', 'early_leave'],
        required: true
    },

    date: {
        type: Date,
        required: true
    },

    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true,
        // Each attendance record belongs to a specific school
    }
}, { timestamps: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;


