import mongoose from "mongoose";

const resultSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
    grade: { type: String, enum: ['A', 'B', 'C', 'D', 'F'], required: true },
    gradePoint: { type: Number, required: true }, // 4.0, 3.0, etc.
    creditHour: { type: Number, required: true },
    semester: { type: String, required: true },
    academicYear: { type: String, required: true },
    remark: { type: String, default: "No feedback from lecturer" }
}, { timestamps: true });

const Result = mongoose.model("Result", resultSchema);
export default Result;