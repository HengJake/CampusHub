import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
    courseName: {
        type: String,
        required: true,
        trim: true,
        // Full name of the course (e.g., "Bachelor of Computer Science (Hons)")
    },

    courseCode: {
        type: String,
        required: true,
        trim: true,
        // Short code for the course (e.g., "BCS", "BBA", "BENG")
    },

    courseDescription: {
        type: String,
        required: true,
        trim: true,
        // Detailed description of the course content and objectives
    },

    courseLevel: {
        type: String,
        enum: ['Diploma', 'Bachelor', 'Master', 'PhD'],
        required: true,
        // Academic level of the course
    },

    courseType: {
        type: String,
        enum: ['Full Time', 'Part Time', 'Distance Learning'],
        required: true,
        default: 'Full Time',
        // Mode of study for the course
    },

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
        // Department offering the course
    },

    duration: {
        type: Number,
        required: true,
        min: 1,
        // Duration in months (e.g., 36 for 3-year degree)
    },

    entryRequirements: {
        type: [String],
        default: [],
        // Array of entry requirements for the course
    },

    careerProspects: {
        type: [String],
        default: [],
        // Array of potential career paths after graduation
    },

    isActive: {
        type: Boolean,
        default: true,
        // Soft delete flag for course status
    },

    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true,
        // Each course belongs to a specific school
    }
}, {
    timestamps: true
});

// Indexes
courseSchema.index({ courseCode: 1 }, { unique: true });
courseSchema.index({ departmentId: 1 });
courseSchema.index({ courseLevel: 1 });
courseSchema.index({ isActive: 1 });

const Course = mongoose.model("Course", courseSchema);
export default Course;