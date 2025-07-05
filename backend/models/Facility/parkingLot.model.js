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

module.exports = mongoose.model('ParkingLot', ParkingLotSchema);