import e from "express";
import {
    createRoom,
    getAllRooms,
    getRoomById,
    updateRoom,
    deleteRoom
} from "../../controllers/Academic/room.controllers.js";

const router = e.Router();

// Create a new room
router.post("/", createRoom);

// Get all rooms
router.get("/", getAllRooms);

// Get room by ID
router.get("/:id", getRoomById);

// Update room by ID
router.put("/:id", updateRoom);

// Delete room by ID
router.delete("/:id", deleteRoom);

export default router;