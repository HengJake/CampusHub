import mongoose from 'mongoose';
const roomSchema = new mongoose.Schema({
    block: {
        type: String,
        required: true,
        trim: true
    },

    floor: {
        type: String,
        required: true,
        trim: true
    },

    roomNumber: {
        type: Number,
        required: true,
        min: 1,
        max: 1000 // Assuming room numbers are between 1 and 1000
    },

    roomStatus: {
        type: String,
        enum: ['available', 'unavailable'],
        required: true
    },

    type: {
        enum: ["classroom", "tech_lab", "office"]
    },

});

const Room = mongoose.model('Room', roomSchema);
export default Room;