// Programmer Name : Heng Jun Kai, Project Manager, Leader Full Stack developer
// Program Name: semesterModule.model.js
// Description: SemesterModule model schema defining the relationship between semesters and modules
// First Written on: December 19, 2024

import mongoose from "mongoose";

const semesterModuleSchema = new mongoose.Schema({
    semesterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Semester',
        required: true,
        // Reference to the semester
    },

    moduleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Module',
        required: true,
        // Reference to the module
    },

    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
        // Reference to the course (for easier querying)
    },

    intakeCourseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'IntakeCourse',
        required: true,
        // Reference to the intake course (for easier querying)
    },

    isActive: {
        type: Boolean,
        default: true,
        // Soft delete flag
    },

    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true,
        // Each semester module belongs to a specific school
    }
}, {
    timestamps: true
});

// Indexes
semesterModuleSchema.index({ semesterId: 1, moduleId: 1, schoolId: 1 }, { unique: true });
semesterModuleSchema.index({ courseId: 1 });
semesterModuleSchema.index({ intakeCourseId: 1 });
semesterModuleSchema.index({ schoolId: 1 });
semesterModuleSchema.index({ isActive: 1 });

// Virtual for checking if module is currently active in semester
semesterModuleSchema.virtual('isCurrentlyActive').get(function () {
    return this.isActive;
});

const SemesterModule = mongoose.model('SemesterModule', semesterModuleSchema);

export default SemesterModule;
