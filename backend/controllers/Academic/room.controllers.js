import Room from '../../models/Academic/room.model.js';
import mongoose from 'mongoose';

// Create Room
export const createRoom = async (req, res) => {
    const { RoomName, RoomDescription, Capacity } = req.body;

    // Validation
    if (!RoomName || !RoomDescription || !Capacity) {
        return res.status(400).json({
            success: false,
            message: "Please provide all required fields (RoomName, RoomDescription, Capacity)",
        });
    }

    try {
        const newRoom = new Room({
            RoomName,
            RoomDescription,
            Capacity
        });

        await newRoom.save();

        return res.status(201).json({
            success: true,
            data: newRoom,
            message: "Room created successfully",
        });
    } catch (error) {
        console.error("Error creating room:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

// Read Rooms
export const getRooms = async (req, res) => {
    try {
        const rooms = await Room.find();

        return res.status(200).json({
            success: true,
            data: rooms,
        });
    } catch (error) {
        console.error("Error fetching rooms:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

// Update Room
export const updateRoom = async (req, res) => {
    const { id } = req.params;
    const { RoomName, RoomDescription, Capacity } = req.body;

    // Validation
    if (!RoomName || !RoomDescription || !Capacity) {
        return res.status(400).json({
            success: false,
            message: "Please provide all required fields (RoomName, RoomDescription, Capacity)",
        });
    }

    try {
        const updatedRoom = await Room.findByIdAndUpdate(id, {
            RoomName,
            RoomDescription,
            Capacity
        }, { new: true });

        if (!updatedRoom) {
            return res.status(404).json({
                success: false,
                message: "Room not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: updatedRoom,
            message: "Room updated successfully",
        });
    } catch (error) {
        console.error("Error updating room:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

// Delete Room
export const deleteRoom = async (req, res) => {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid room ID format",
        });
    }

    try {
        const deletedRoom = await Room.findByIdAndDelete(id);

        if (!deletedRoom) {
            return res.status(404).json({
                success: false,
                message: "Room not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Room deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting room:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
