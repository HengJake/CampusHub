import mongoose from 'mongoose';
import Intake from './intake.model';

const studentSchema = new mongoose.Schema({
    UserID: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    SchoolID: {
        type: Schema.Types.ObjectId,
        ref: 'School',
        required: true,
        validate: {
            validator: async function(v) {
                const schoolExists = await mongoose.model('School').exists({ _id: v });
                return schoolExists;
            },
            message: props => 'School does not exist!'
        }
    },

    IntakeID: {
        type: Schema.Types.ObjectId,    
        ref: 'Intake',
        required: true,
        validate: {
            validator: async function(v) {
                const intakeExists = await Intake.exists({ _id: v });
                return intakeExists;
            },
            message: props => 'Intake does not exist!'      
        }
    },

    CourseID: {
        type: Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
        validate: {
            validator: async function(v) {
                const courseExists = await mongoose.model('Course').exists({ _id: v });
                return courseExists;
            },
            message: props => 'Course does not exist!'
        }   
    },

    Year: {
        type: Number,
        required: true,
        min: 1,
        max: 5, // Assuming a maximum of 5 years for a course
        validate: {
            validator: function(v) {
                return Number.isInteger(v);
            },
            message: props => `${props.value} is not a valid year!`
        }
    },  

});

const Student = mongoose.model('Student', studentSchema);
export default Student;
