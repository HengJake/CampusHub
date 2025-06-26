import mongoose from 'mongoose';
import Course from './course.model';

const examScheduleSchema = new mongoose.Schema({
    IntakeID: {
        type: Schema.Types.ObjectId,
        ref: "Intake",
        required: true
    }, 

    CourseID: {
        type: Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },  

    ModuleID: {
        type: Schema.Types.ObjectId,   
        ref: "Module",
        required: true
    },

    ExamDate: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /^\d{4}-\d{2}-\d{2}$/.test(v);
            },
            message: props => `${props.value} is not a valid date format!`
        }        
    },

    ExamTime: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
            },
            message: props => `${props.value} is not a valid time format!`
        }   
    },

    RoomID: {
        type: Schema.Types.ObjectId,    
        ref: "Room",
        required: true
    },  

    Invigilators: {
        type: [Schema.Types.ObjectId],
        ref: "Lecturer",
        required: true
    },

    DurationMinute: {
        type: Number,
        required: true,
        min: 1 // Duration in minutes
    },
});

const ExamSchedule = mongoose.model('ExamSchedule', examScheduleSchema);
export default ExamSchedule;