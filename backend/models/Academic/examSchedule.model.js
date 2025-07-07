import mongoose from 'mongoose';
import Course from './course.model.js';

const examScheduleSchema = new mongoose.Schema({
    intakeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Intake",
        required: true
    },

    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },

    moduleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Module",
        required: true
    },

    examDate: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                return /^\d{4}-\d{2}-\d{2}$/.test(v);
            },
            message: props => `${props.value} is not a valid date format!`
        }
    },

    examTime: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
            },
            message: props => `${props.value} is not a valid time format!`
        }
    },

    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
        required: true
    },

    invigilators: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Lecturer",
        required: true
    },

    durationMinute: {
        type: Number,
        required: true,
        min: 1 // Duration in minutes
    },
});

const ExamSchedule = mongoose.model('ExamSchedule', examScheduleSchema);
export default ExamSchedule;