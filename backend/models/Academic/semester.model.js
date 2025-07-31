import mongoose from "mongoose";

const semesterSchema = new mongoose.Schema({
    intakeCourseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'IntakeCourse',
        required: true,
        // Reference to the specific course offering within an intake
    },

    semesterNumber: {
        type: Number,
        required: true,
        min: 1,
        // Semester number within the course (1, 2, 3, etc.)
    },

    semesterName: {
        type: String,
        required: true,
        trim: true,
        // e.g., "Semester 1", "Semester 2", "Year 1 Semester 1"
    },

    // Academic Calendar for this semester
    startDate: {
        type: Date,
        required: true,
        // When this semester begins
    },

    endDate: {
        type: Date,
        required: true,
        validate: {
            validator: function (v) {
                return v > this.startDate;
            },
            message: 'End date must be after start date'
        },
        // When this semester ends
    },

    // Important semester dates
    registrationStartDate: {
        type: Date,
        required: true,
        // When course registration opens for this semester
    },

    registrationEndDate: {
        type: Date,
        required: true,
        validate: {
            validator: function (v) {
                return v > this.registrationStartDate && v <= this.startDate;
            },
            message: 'Registration end date must be after registration start date and before semester start date'
        },
        // When course registration closes for this semester
    },

    examStartDate: {
        type: Date,
        required: true,
        validate: {
            validator: function (v) {
                return v >= this.startDate && v <= this.endDate;
            },
            message: 'Exam start date must be within semester dates'
        },
        // When final exams begin
    },

    examEndDate: {
        type: Date,
        required: true,
        validate: {
            validator: function (v) {
                return v > this.examStartDate && v <= this.endDate;
            },
            message: 'Exam end date must be after exam start date and within semester dates'
        },
        // When final exams end
    },

    isActive: {
        type: Boolean,
        default: true,
        // Soft delete flag
    },

    status: {
        type: String,
        enum: ['upcoming', 'registration_open', 'in_progress', 'exam_period', 'completed'],
        default: 'upcoming',
        // Current status of the semester
    },

    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true,
        // Each semester belongs to a specific school
    }
}, {
    timestamps: true
});

// Indexes
semesterSchema.index({ intakeCourseId: 1, semesterNumber: 1 }, { unique: true });
semesterSchema.index({ schoolId: 1 });
semesterSchema.index({ status: 1 });
semesterSchema.index({ startDate: 1, endDate: 1 });
semesterSchema.index({ isActive: 1 });

// Virtual for checking if semester is current
semesterSchema.virtual('isCurrent').get(function () {
    const now = new Date();
    return now >= this.startDate && now <= this.endDate;
});

// Virtual for checking if registration is open
semesterSchema.virtual('isRegistrationOpen').get(function () {
    const now = new Date();
    return now >= this.registrationStartDate && now <= this.registrationEndDate;
});

const Semester = mongoose.model("Semester", semesterSchema);
export default Semester;