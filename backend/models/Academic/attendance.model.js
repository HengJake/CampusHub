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
});

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;

// Middleware to ensure users can only access their school's data
const schoolAuthMiddleware = (req, res, next) => {
    const userSchoolId = req.user.schoolId;
    const requestedSchoolId = req.params.schoolId || req.body.schoolId;

    if (userSchoolId !== requestedSchoolId) {
        return res.status(403).json({ message: "Access denied" });
    }
    next();
};

