import mongoose from "mongoose";

const intakeCourseSchema = new mongoose.Schema({
    intakeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Intake',
        required: true,
        // Reference to the intake period
    },

    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
        // Reference to the course being offered
    },

    // Enrollment Management
    maxStudents: {
        type: Number,
        required: true,
        min: 1,
        // Maximum number of students allowed for this course in this intake
    },

    currentEnrollment: {
        type: Number,
        default: 0,
        min: 0,
        // Current number of enrolled students for this course
    },

    // Fee Structure (can vary by intake)
    feeStructure: {
        localStudent: {
            type: Number,
            required: true,
            // Fee for Malaysian students for this course in this intake
        },
        internationalStudent: {
            type: Number,
            required: true,
            // Fee for international students for this course in this intake
        }
    },

    // Course-specific details for this intake
    duration: {
        type: Number,
        required: true,
        min: 1,
        // Duration in months for this course in this intake
    },

    maxDuration: {
        type: Number,
        required: true,
        // Maximum duration in months (for part-time students)
    },

    requirements: {
        type: [String],
        default: [],
        // Array of specific requirements for this course in this intake
    },

    isActive: {
        type: Boolean,
        default: true,
        // Soft delete flag for intake-course status
    },

    status: {
        type: String,
        enum: ['available', 'full', 'closed', 'cancelled'],
        default: 'available',
        // Status of this course offering in this intake
    }
}, {
    timestamps: true
});

// Compound index to ensure unique intake-course combinations
intakeCourseSchema.index({ intakeId: 1, courseId: 1 }, { unique: true });

// Indexes
intakeCourseSchema.index({ intakeId: 1 });
intakeCourseSchema.index({ courseId: 1 });
intakeCourseSchema.index({ isActive: 1 });
intakeCourseSchema.index({ status: 1 });

// Virtual for checking if course is full
intakeCourseSchema.virtual('isFull').get(function () {
    return this.currentEnrollment >= this.maxStudents;
});

const IntakeCourse = mongoose.model("IntakeCourse", intakeCourseSchema);
export default IntakeCourse;