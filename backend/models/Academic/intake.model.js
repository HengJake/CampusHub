import mongoose from "mongoose";

const intakeSchema = new mongoose.Schema({
    intakeName: {
        type: String,
        required: true,
        trim: true,
        // Name of the intake period (e.g., "January 2024 Intake")
    },

    intakeMonth: {
        type: String,
        enum: ['January', 'May', 'September'],
        required: true,
        // Month when the intake starts (Malaysian academic calendar)
    },

    totalYear: {
        type: Number,
        required: true,
        // total Year
    },

    totalSemester: {
        type: Number,
        required: true,
        //total semester
    },

    // Academic Calendar Dates
    registrationStartDate: {
        type: Date,
        required: true,
        // Date when student registration opens
    },

    registrationEndDate: {
        type: Date,
        required: true,
        // Date when student registration closes
    },

    orientationDate: {
        type: Date,
        required: true,
        // Date of student orientation program
    },

    examinationStartDate: {
        type: Date,
        required: true,
        // Date when examinations begin
    },

    examinationEndDate: {
        type: Date,
        required: true,
        // Date when examinations end
    },

    academicEvents: [{
        name: { type: String, required: true },
        date: { type: Date, required: true },
        type: {
            type: String,
            enum: ['holiday', 'exam', 'break', 'registration', 'orientation']
        },
        description: { type: String }
    }],

    isActive: {
        type: Boolean,
        default: true,
        // Soft delete flag for intake status
    },

    status: {
        type: String,
        enum: ['planning', 'registration_open', 'registration_closed', 'in_progress', 'completed'],
        default: 'planning',
        // Current status of the intake period
    },

    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true,
        // Each intake belongs to a specific school
    },

    completionDate: {
        type: Date,
        required: true
    },
}, {
    timestamps: true
});

// Indexes

intakeSchema.index({ schoolId: 1, intakeName: 1 }, { unique: true });
intakeSchema.index({ academicYear: 1, semester: 1 });
intakeSchema.index({ intakeMonth: 1 });
intakeSchema.index({ isActive: 1 });
intakeSchema.index({ status: 1 });

// Virtual for checking if registration is open
intakeSchema.virtual('isRegistrationOpen').get(function () {
    const now = new Date();
    return now >= this.registrationStartDate && now <= this.registrationEndDate;
});

const Intake = mongoose.model("Intake", intakeSchema);
export default Intake;