import mongoose from "mongoose";

const resultSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
    grade: { type: String, enum: ['A', 'B', 'C', 'D', 'F'], required: true },
    creditHour: { type: Number, required: true },
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