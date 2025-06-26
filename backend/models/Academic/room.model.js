import mongoose from 'mongoose';
const roomSchema = new mongoose.Schema({
    Block: {
        type: String,
        required: true,
        trim: true
    },

    Floor: {
        type: String,
        required: true,
        trim: true
    },

    room_number: {
        type: Number,
        required: true,
        min: 1,
        max: 1000 // Assuming room numbers are between 1 and 1000
    },

    RoomStatus: {
        type: String,   
        enum: ['available', 'unavailable'],
        required: true
    },

    type: {
        enum: ["classroom", "tech_lab", "office"]
    },

});

const Lecturer = mongoose.model('Lecturer', lecturerSchema);
export default Lecturer;

