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
    maxDuration: {
        type: Number,
        required: true,
        // Maximum duration in months (for part-time/flexible students)
        // Use course.duration as the standard duration
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
    },

    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true,
        // Each intake-course combination belongs to a specific school
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

// Pre-save middleware to automatically update status based on enrollment
intakeCourseSchema.pre('save', function (next) {
    // Only update status if currentEnrollment has changed
    if (this.isModified('currentEnrollment')) {
        if (this.currentEnrollment >= this.maxStudents) {
            this.status = 'full';
        } else if (this.currentEnrollment > 0) {
            this.status = 'available';
        } else {
            this.status = 'available'; // Default for 0 enrollment
        }
    }
    next();
});

// Pre-update middleware for findByIdAndUpdate operations
intakeCourseSchema.pre('findOneAndUpdate', function (next) {
    const update = this.getUpdate();

    // If currentEnrollment is being updated, also update status
    if (update.currentEnrollment !== undefined) {
        let newStatus = 'available';
        if (update.currentEnrollment >= update.maxStudents) {
            newStatus = 'full';
        } else if (update.currentEnrollment > 0) {
            newStatus = 'available';
        }

        // Add status to the update if it's not already there
        if (update.status === undefined) {
            update.status = newStatus;
        }
    }

    next();
});

// Virtual for checking if course is full
intakeCourseSchema.virtual('isFull').get(function () {
    return this.currentEnrollment >= this.maxStudents;
});

const IntakeCourse = mongoose.model("IntakeCourse", intakeCourseSchema);
export default IntakeCourse;