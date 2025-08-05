import e from "express";
import {
    createAttendance,
    getAllAttendance,
    getAttendanceById,
    updateAttendance,
    deleteAttendance,
    deleteAllAttendances,
    getAttendanceBySchoolId,
    getAttendanceByStudentId
} from "../../controllers/Academic/attendance.controllers.js";

const router = e.Router();

// Create a new attendance record
router.post("/", createAttendance);

// Get all attendance records
router.get("/", getAllAttendance);

// Get attendance record by ID
router.get("/:id", getAttendanceById);

router.get('/school/:schoolId', getAttendanceBySchoolId);
router.get('/student/:studentId', getAttendanceByStudentId);

// Update attendance record by ID
router.put("/:id", updateAttendance);

// Delete all attendances
router.delete("/all", deleteAllAttendances);

// Delete attendance by ID
router.delete("/:id", deleteAttendance);

export default router;