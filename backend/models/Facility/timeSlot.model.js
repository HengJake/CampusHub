import mongoose from "mongoose";

const TimeslotSchema = new mongoose.Schema({
    resourceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resource',
        required: true,
    },
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true,
    },
    dayOfWeek: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        required: true
    }, 
    timeslot: [
        {
            start: { type: String, required: true }, // "09:00"
            end: { type: String, required: true },   // "10:00"
        },
    ],
});

export default mongoose.model('Timeslot', TimeslotSchema);