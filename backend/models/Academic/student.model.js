// Programmer Name : Ritchie Boon Win Yew, Backend Developer
// Program Name: student.model.js
// Description: Student model schema defining student academic information, enrollment details, and relationship with courses and modules
// First Written on: June 30, 2024
// Edited on: Friday, July 8, 2024

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
    },

    currentYear: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
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
        enum: ['enrolled', 'in_progress', 'graduated', 'dropped', 'suspended'],
        default: 'enrolled',
        // Current status of the student (consolidated from completionStatus)
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

// Virtual to get intake course info
studentSchema.virtual('intakeCourseInfo', {
    ref: 'IntakeCourse',
    localField: 'intakeCourseId',
    foreignField: '_id',
    justOne: true
});

const Student = mongoose.model('Student', studentSchema);
export default Student;
