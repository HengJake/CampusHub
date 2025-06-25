import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
    StudentID: {
        type: Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },

    ScheduleID: {
        type: Schema.Types.ObjectId,
        ref: 'ClassSchedule',
        required: true
    },

    Status: {
        type: String,
        enum: ['present', 'absent', 'late'],
        required: true
    },

    Date: {
        type: Date,
        required: true
    }
});

const Attendace = mongoose.model('Attendance',attendanceSchema);
export default Attendace;

