import e from "express";
import {
    createAttendance,
    getAllAttendance,
    getAttendanceById,
    updateAttendance,
    deleteAttendance
} from "../../controllers/Academic/attendance.controllers.js";

const router = e.Router();

// Create a new attendance record
router.post("/", createAttendance);

// Get all attendance records
router.get("/", getAllAttendance);

// Get attendance record by ID
router.get("/:id", getAttendanceById);

// Update attendance record by ID
router.put("/:id", updateAttendance);

// Delete attendance record by ID
router.delete("/:id", deleteAttendance);

export default router;