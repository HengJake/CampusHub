import mongoose from "mongoose";

const moduleSchema = new mongoose.Schema({
    moduleName: {
        type: String,
        required: true,
        trim: true,
        // Name of the module (e.g., "Database Systems", "Web Development")
    },

    code: {
        type: String,
        required: true,
        trim: true,
        // Module code (e.g., "CS101", "DB201")
    },

    totalCreditHour: {
        type: Number,
        required: true,
        min: 1,
        // Credit hours allocated to this module
    },

    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true,
        // Course this module belongs to
    },

    prerequisites: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Module',
        default: [],
        // Array of modules that must be completed before this module
    },

    moduleDescription: {
        type: String,
        required: true,
        trim: true,
        // Detailed description of module content and learning outcomes
    },

    learningOutcomes: {
        type: [String],
        default: [],
        // Array of learning outcomes for this module
    },

    assessmentMethods: {
        type: [String],
        enum: ['exam', 'assignment', 'project', 'presentation', 'quiz'],
        default: ['exam', 'assignment'],
        // Methods used to assess student performance
    },

    isActive: {
        type: Boolean,
        default: true,
        // Soft delete flag for module status
    }
}, {
    timestamps: true
});

// Indexes
moduleSchema.index({ code: 1 }, { unique: true });
moduleSchema.index({ courseId: 1 });
moduleSchema.index({ isActive: 1 });

const Module = mongoose.model("Module", moduleSchema);
export default Module;