// Programmer Name : Ritchie Boon Win Yew, Backend Developer
// Program Name: classSchedule.model.js
// Description: ClassSchedule model schema defining class timetables, room assignments, and scheduling conflicts management
// First Written on: July 8, 2024
// Edited on: Friday, July 10, 2024

import mongoose from "mongoose";

const classScheduleSchema = new mongoose.Schema({
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
        required: true
    },

    semesterModuleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SemesterModule",
        required: true
        // Reference to the semester-module relationship instead of just moduleId
    },

    lecturerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lecturer",
        required: true
    },

    dayOfWeek: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        required: true
    },

    startTime: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
            },
            message: props => `${props.value} is not a valid time format!`
        }
    },

    endTime: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
            },
            message: props => `${props.value} is not a valid time format!`
        }
    },
    
    intakeCourseId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'IntakeCourse', 
        required: true 
    },

    // Note: semesterId is now available through semesterModuleId.semesterId
    // Keeping it for backward compatibility but it's redundant

    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true,
        // Each schedule belongs to a specific school
    },

    moduleStartDate: {
        type: Date,
        required: true,
    },

    moduleEndDate: {
        type: Date,
        required: true,
    },
});

const ClassSchedule = mongoose.model("ClassSchedule", classScheduleSchema);
export default ClassSchedule;
