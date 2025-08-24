// Programmer Name : Ritchie Boon Win Yew, Backend Developer
// Program Name: lockerUnit.model.js
// Description: LockerUnit model schema defining locker facility management, unit assignment, and access control
// First Written on: July 10, 2024
// Edited on: Friday, July 10, 2024

import mongoose from "mongoose";

const LockerUnitSchema = new mongoose.Schema({
    resourceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resource',
        required: true,
        unique: true
    },
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true,
    },
    status: {
        type: String,
        enum: ['Available', 'Occupied', 'Maintenance'],
        default: 'Available',
    },
    isAvailable: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

export default mongoose.model('LockerUnit', LockerUnitSchema);