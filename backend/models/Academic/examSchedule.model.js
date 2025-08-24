// Programmer Name : Ritchie Boon Win Yew, Backend Developer
// Program Name: examSchedule.model.js
// Description: ExamSchedule model schema defining examination timetables, venue assignments, and exam duration management
// First Written on: July 10, 2024
// Edited on: Friday, July 10, 2024

import mongoose from 'mongoose';
import Course from './course.model.js';

const examScheduleSchema = new mongoose.Schema({
    intakeCourseId: { type: mongoose.Schema.Types.ObjectId, ref: 'IntakeCourse', required: true }, // Add this

    semesterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Semester',
        required: true,
        // Reference to the semester when this exam is scheduled
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

    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true,
        // Each exam schedule belongs to a specific school
    },
});

const ExamSchedule = mongoose.model('ExamSchedule', examScheduleSchema);
export default ExamSchedule;