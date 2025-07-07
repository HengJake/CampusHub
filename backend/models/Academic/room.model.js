import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
    block: {
        type: String,
        required: true,
        trim: true,
        // Building block identifier (e.g., "Block A", "Main Campus")
    },

    floor: {
        type: String,
        required: true,
        trim: true,
        // Floor level of the room (e.g., "Ground Floor", "Level 1")
    },

    roomNumber: {
        type: Number,
        required: true,
        min: 1,
        max: 1000,
        // Unique room number within the building
    },

    roomStatus: {
        type: String,
        enum: ['available', 'unavailable', 'maintenance', 'reserved'],
        required: true,
        default: 'available',
        // Current availability status of the room
    },

    type: {
        type: String,
        enum: ["classroom", "tech_lab", "office", "lecture_hall", "seminar_room"],
        required: true,
        // Type of room and its intended use
    },

    capacity: {
        type: Number,
        required: true,
        min: 1,
        // Maximum number of people the room can accommodate
    },

    facilities: {
        type: [String],
        default: [],
        // Array of available facilities (e.g., ["projector", "whiteboard", "air_conditioning"])
    },

    isActive: {
        type: Boolean,
        default: true,
        // Soft delete flag for room status
    }
}, {
    timestamps: true
});

// Compound index for unique room identification
roomSchema.index({ block: 1, floor: 1, roomNumber: 1 }, { unique: true });
roomSchema.index({ roomStatus: 1 });
roomSchema.index({ type: 1 });
roomSchema.index({ isActive: 1 });

const Room = mongoose.model('Room', roomSchema);
export default Room;