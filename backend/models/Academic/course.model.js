import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
    courseName: { type: String, required: true },
    courseDescription: {
        type: String,
        required: true,
        trim: true,
        // Detailed course description
    },
    // 1 for 1 month
    duration: { type: Number, required: true },
    // 2024/2025
    academicYear: { type: String, required: true },
    semester: { type: String, enum: ['Fall', 'Spring', 'Summer'], required: true },
    totalCreditHours: {
        type: Number,
        required: true,
        min: 1,
        // Total credit hours required for graduation
    },

    minimumCGPA: {
        type: Number,
        min: 0,
        max: 4,
        default: 2.0,
        // Minimum CGPA required for graduation
    },
    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
        // To soft delete/archive courses
    },
});

const Course = mongoose.model("Course", courseSchema);

export default Course;