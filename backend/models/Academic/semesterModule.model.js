// Programmer Name : Heng Jun Kai, Project Manager, Leader Full Stack developer
// Program Name: semesterModule.model.js
// Description: SemesterModule model schema defining the many-to-many relationship between semesters and modules
// First Written on: December 19, 2024
// Edited on: December 19, 2024

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
 
    intakeCourseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'IntakeCourse',
        required: true,
        // Reference to the specific intake course (for easier querying)
    },

    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true,
        // Each semester-module relationship belongs to a specific school
    },

    // Academic year and semester info for easier querying
    academicYear: {
        type: Number,
        required: true,
        // Academic year (e.g., 2024, 2025)
    },

    semesterNumber: {
        type: Number,
        required: true,
        // Semester number within the academic year (1, 2, 3, etc.)
    },

    // Module assignment details
    isActive: {
        type: Boolean,
        default: true,
        // Soft delete flag
    },

    // Optional: Additional metadata for the semester-module relationship
    assignmentDate: {
        type: Date,
        default: Date.now,
        // When this module was assigned to the semester
    },

    // Optional: Notes about this specific assignment
    notes: {
        type: String,
        trim: true,
        // Any special notes about this module in this semester
    },

    // Optional: Custom assessment methods for this semester (overrides module defaults)
    customAssessmentMethods: {
        type: [String],
        enum: ['exam', 'assignment', 'project', 'presentation', 'quiz'],
        // Custom assessment methods for this specific semester
    },

    // Optional: Semester-specific module requirements or modifications
    semesterSpecificRequirements: {
        type: String,
        trim: true,
        // Any semester-specific requirements or modifications
    }
}, {
    timestamps: true
});

// Indexes for efficient querying
semesterModuleSchema.index({ semesterId: 1, moduleId: 1 }, { unique: true });
semesterModuleSchema.index({ intakeCourseId: 1, academicYear: 1, semesterNumber: 1 });
semesterModuleSchema.index({ intakeCourseId: 1 });
semesterModuleSchema.index({ schoolId: 1 });
semesterModuleSchema.index({ isActive: 1 });
semesterModuleSchema.index({ academicYear: 1, semesterNumber: 1 });

// Virtual for checking if the semester-module relationship is current
semesterModuleSchema.virtual('isCurrent').get(function () {
    const now = new Date();
    // This would need to be populated from the semester data
    // For now, we'll return null to indicate it needs to be populated
    return null;
});

// Pre-save middleware to populate academic year and semester number
semesterModuleSchema.pre('save', async function(next) {
    try {
        console.log("🚀 ~ semesterModule pre-save ~ Document:", this);
        console.log("🚀 ~ semesterModule pre-save ~ isNew:", this.isNew);
        console.log("🚀 ~ semesterModule pre-save ~ academicYear:", this.academicYear);
        console.log("🚀 ~ semesterModule pre-save ~ semesterNumber:", this.semesterNumber);
        
        // Only populate if academicYear and semesterNumber are not already set
        if ((this.isNew || this.isModified('semesterId')) && (!this.academicYear || !this.semesterNumber)) {
            console.log("🚀 ~ semesterModule pre-save ~ Populating missing fields...");
            
            // Populate academic year and semester number from semester
            const Semester = mongoose.model('Semester');
            const semester = await Semester.findById(this.semesterId);
            console.log("🚀 ~ semesterModule pre-save ~ Semester found:", semester);
            
            if (semester) {
                if (!this.academicYear) {
                    this.academicYear = new Date(semester.startDate).getFullYear();
                    console.log("🚀 ~ semesterModule pre-save ~ Set academicYear to:", this.academicYear);
                }
                if (!this.semesterNumber) {
                    this.semesterNumber = semester.semesterNumber;
                    console.log("🚀 ~ semesterModule pre-save ~ Set semesterNumber to:", this.semesterNumber);
                }
            }
        } else {
            console.log("🚀 ~ semesterModule pre-save ~ Fields already set, skipping population");
        }
        
        console.log("🚀 ~ semesterModule pre-save ~ Final document:", this);
        next();
    } catch (error) {
        console.error("🚨 ~ semesterModule pre-save ~ Error:", error);
        next(error);
    }
});

// Static method to get modules for a specific semester
semesterModuleSchema.statics.getModulesBySemester = function(semesterId) {
    return this.find({ 
        semesterId, 
        isActive: true 
    }).populate('moduleId');
};

// Static method to get semesters for a specific module
semesterModuleSchema.statics.getSemestersByModule = function(moduleId) {
    return this.find({ 
        moduleId, 
        isActive: true 
    }).populate('semesterId');
};

// Static method to get semester modules by intake course and academic year
semesterModuleSchema.statics.getByIntakeCourseAndYear = function(intakeCourseId, academicYear) {
    return this.find({ 
        intakeCourseId, 
        academicYear, 
        isActive: true 
    }).populate(['semesterId', 'moduleId']);
};

// Instance method to check if module can be added to semester
semesterModuleSchema.methods.canAddModule = async function() {
    // Check if module is already assigned to this semester
    const existing = await this.constructor.findOne({
        semesterId: this.semesterId,
        moduleId: this.moduleId,
        isActive: true,
        _id: { $ne: this._id } // Exclude current document if updating
    });
    
    return !existing;
};

const SemesterModule = mongoose.model("SemesterModule", semesterModuleSchema);
export default SemesterModule;
