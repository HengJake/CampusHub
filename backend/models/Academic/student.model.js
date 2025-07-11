import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        // Reference to user account (contains personal info)
    },

    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true,
        // Reference to the school the student belongs to
        validate: {
            validator: async function (v) {
                const schoolExists = await mongoose.model('School').exists({ _id: v });
                return schoolExists;
            },
            message: props => 'School does not exist!'
        }
    },

    intakeCourseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'IntakeCourse',
        required: true,
        // Reference to specific course offering in specific intake
        validate: {
            validator: async function (v) {
                const intakeCourseExists = await IntakeCourse.exists({ _id: v });
                return intakeCourseExists;
            },
            message: props => 'IntakeCourse does not exist!'
        }
    },

    completionStatus: {
        type: String,
        enum: ["completed", "in progress", "dropped",],
        default: "in progress",
        required: true,
    },

    completionDate: {
        type: Date,
    },

    year: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
        // Current year of study (1st year, 2nd year, etc.)
        validate: {
            validator: function (v) {
                return Number.isInteger(v);
            },
            message: props => `${props.value} is not a valid year!`
        }
    },

    currentSemester: {
        type: Number,
        required: true,
        min: 1,
        // Current semester within the year
    },

    cgpa: {
        type: Number,
        min: 0,
        max: 4,
        default: 0,
        // Cumulative Grade Point Average
    },

    status: {
        type: String,
        enum: ['enrolled', 'active', 'graduated', 'dropped', 'suspended'],
        default: 'enrolled',
        // Current status of the student
    },

    enrollmentDate: {
        type: Date,
        default: Date.now,
        // Date when student was enrolled
    },

    totalCreditHours: {
        type: Number,
        default: 0,
        min: 0,
        // Total credit hours completed
    },

    completedCreditHours: {
        type: Number,
        default: 0,
        min: 0,
        // Credit hours completed successfully
    },

    academicStanding: {
        type: String,
        enum: ['good', 'warning', 'probation', 'suspended'],
        default: 'good',
        // Academic standing based on performance
    }
}, {
    timestamps: true
});

// Indexes
studentSchema.index({ userId: 1 });
studentSchema.index({ schoolId: 1 });
studentSchema.index({ intakeCourseId: 1 });
studentSchema.index({ status: 1 });

// Virtual to get course info
studentSchema.virtual('courseInfo', {
    ref: 'IntakeCourse',
    localField: 'intakeCourseId',
    foreignField: '_id',
    justOne: true
});

// Virtual to get intake info
studentSchema.virtual('intakeInfo', {
    ref: 'IntakeCourse',
    localField: 'intakeCourseId',
    foreignField: '_id',
    justOne: true
});

const Student = mongoose.model('Student', studentSchema);
export default Student;