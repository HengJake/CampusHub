import mongoose from "mongoose";

const ParkingLotSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true,
    },
    zone: { type: String, required: true },
    slotNumber: { type: Number, required: true },
    active: { type: Boolean, default: true },
}, { timestamps: true });

// Add compound unique index for schoolId + zone + slotNumber
ParkingLotSchema.index({ schoolId: 1, zone: 1, slotNumber: 1 }, { unique: true });

export default mongoose.model('ParkingLot', ParkingLotSchema);