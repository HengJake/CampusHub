import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
    },
    resourceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resource',
        required: true,
    },
    startTime: { type: String, required: true }, // e.g., "14:00"
    endTime: { type: String, required: true },   // e.g., "15:00"
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'cancelled'],
        default: 'pending',
    },
});

export default mongoose.model('Booking', BookingSchema);