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


