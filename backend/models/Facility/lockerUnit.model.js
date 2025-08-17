import mongoose from "mongoose";

const LockerUnitSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
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