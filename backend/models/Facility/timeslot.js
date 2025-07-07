import mongoose from "mongoose";

const TimeslotSchema = new mongoose.Schema({
    resourceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resource',
        required: true,
    },
    dayOfWeek: { type: Number, required: true }, // 0 = Sunday, 6 = Saturday
    timeslot: [
        {
            start: { type: String, required: true }, // "09:00"
            end: { type: String, required: true },   // "10:00"
        },
    ],
});

export default mongoose.model('Timeslot', TimeslotSchema);