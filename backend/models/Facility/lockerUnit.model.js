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
    isAvailable: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

export default mongoose.model('LockerUnit', LockerUnitSchema);