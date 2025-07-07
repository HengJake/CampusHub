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
        enum: ['present', 'absent', 'late'],
        required: true
    },

    date: {
        type: Date,
        required: true
    }
});

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;

