import mongoose from "mongoose";

const classScheduleSchema = new mongoose.Schema({
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
        required: true
    },

    moduleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Module",
        required: true
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
    intakeCourseId: { type: mongoose.Schema.Types.ObjectId, ref: 'IntakeCourse', required: true }, // Add this

    semesterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Semester',
        required: true,
        // Reference to the semester when this class is scheduled
    },

    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true,
        // Each schedule belongs to a specific school
    },

    moduleStartDate: {
        type: Date,
        required: true,
        validate: {
            validator: function (v) {
                return v instanceof Date && !isNaN(v);
            },
            message: 'Module start date must be a valid date'
        }
    },

    moduleEndDate: {
        type: Date,
        required: true,
        validate: {
            validator: function (v) {
                return v instanceof Date && !isNaN(v) && v > this.moduleStartDate;
            },
            message: 'Module end date must be a valid date and after start date'
        }
    },
});

const ClassSchedule = mongoose.model("ClassSchedule", classScheduleSchema);
export default ClassSchedule;
