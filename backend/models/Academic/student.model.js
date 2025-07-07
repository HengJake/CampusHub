import mongoose from 'mongoose';
import Intake from './intake.model.js';

// Remove redundant courseId
const studentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    intakeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Intake', required: true },
    // Remove courseId - get it from intake
    year: { type: Number, required: true, min: 1, max: 5 },
    currentSemester: { type: Number, required: true, min: 1 },
    cgpa: { type: Number, min: 0, max: 4, default: 0 },
    status: { 
        type: String, 
        enum: ['enrolled', 'active', 'graduated', 'dropped'], 
        default: 'enrolled' 
    }
});

const Student = mongoose.model('Student', studentSchema);
export default Student;
