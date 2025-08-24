// Programmer Name : Ritchie Boon Win Yew, Backend Developer
// Program Name: department.model.js
// Description: Department model schema defining academic department structure, faculty organization, and administrative hierarchy
// First Written on: July 4, 2024
// Edited on: Friday, July 10, 2024

import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
    departmentName: {
        type: String,
        required: true,
        trim: true,
        // Name of the academic department (e.g., "Computer Science", "Business Administration")
    },

    departmentDescription: {
        type: String,
        required: true,
        trim: true,
        // Detailed description of the department's focus and objectives
    },

    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
        required: true,
        // Physical location/office of the department
    },

    isActive: {
        type: Boolean,
        default: true,
        // Soft delete flag for department status
    },

    headOfDepartment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lecturer',
        // Reference to the department head (lecturer)
    },

    contactEmail: {
        type: String,
        required: true,
        // Department contact email
    },

    contactPhone: {
        type: String,
        required: true,
        // Department contact phone number
    },

    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true,
        // Each department belongs to a specific school
    }
}, {
    timestamps: true
});

// Indexes
departmentSchema.index({ schoolId: 1, departmentName: 1 }, { unique: true });
departmentSchema.index({ isActive: 1 });

const Department = mongoose.model('Department', departmentSchema);
export default Department;