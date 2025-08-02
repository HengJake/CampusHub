import mongoose from "mongoose";

const resultSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
    grade: { type: String, enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F'], required: true },
    creditHours: { type: Number, required: true },
    marks: { type: Number, min: 0, max: 100 },
    totalMarks: { type: Number, min: 0, default: 100 },
    gpa: { type: Number, min: 0, max: 4.0 },
    remark: { type: String, default: "No feedback from lecturer" },
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true,
        // Each result belongs to a specific school
    }
}, { timestamps: true });

const Result = mongoose.model("Result", resultSchema);
export default Result;