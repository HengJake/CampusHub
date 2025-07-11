import mongoose from 'mongoose';
import Department from './department.model.js';
import Module from './module.model.js';

const lecturerSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
        // Reference to user account (contains personal info)
    },

    title: {
        type: [String],
        required: true,
        // Array of academic titles (e.g., ["Dr.", "Associate Professor"])
        validate: {
            validator: function (v) {
                return v.length > 0;
            },
            message: props => 'At least one title is required!'
        }
    },

    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true,
        // Department the lecturer belongs to
        validate: {
            validator: async function (v) {
                const departmentExists = await Department.exists({ _id: v });
                return departmentExists;
            },
            message: props => 'Department does not exist!'
        }
    },

    moduleIds: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Module',
        default: [],
        // Array of modules the lecturer teaches
        validate: {
            validator: async function (v) {
                if (v.length === 0) return true; // Allow empty array
                const moduleExists = await Module.exists({ _id: { $in: v } });
                return moduleExists;
            },
            message: props => 'One or more modules do not exist!'
        }
    },

    specialization: {
        type: [String],
        default: [],
        // Array of academic specializations (e.g., ["Database Systems", "AI"])
    },

    qualification: {
        type: String,
        required: true,
        // Highest academic qualification (e.g., "PhD", "Master's")
    },

    experience: {
        type: Number,
        required: true,
        min: 0,
        // Years of teaching experience
    },

    isActive: {
        type: Boolean,
        default: true,
        // Soft delete flag for lecturer status
    },

    officeHours: {
        type: [{
            day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] },
            startTime: { type: String },
            endTime: { type: String }
        }],
        default: [],
        // Lecturer's office hours for student consultation
    },

    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true,
        // Each lecturer belongs to a specific school
    },
}, {
    timestamps: true
});

// Indexes
lecturerSchema.index({ departmentId: 1 });
lecturerSchema.index({ isActive: 1 });

const Lecturer = mongoose.model('Lecturer', lecturerSchema);
export default Lecturer;