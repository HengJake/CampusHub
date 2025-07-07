import e from "express";
import {
    createExamSchedule,
    getExamSchedules,
    getExamScheduleById,
    updateExamSchedule,
    deleteExamSchedule
} from "../../controllers/Academic/examSchedule.controllers.js";

const router = e.Router();

// Create a new exam schedule
router.post("/", createExamSchedule);

// Get all exam schedules
router.get("/", getExamSchedules);

// Get exam schedule by ID
router.get("/:id", getExamScheduleById);

// Update exam schedule by ID
router.put("/:id", updateExamSchedule);

// Delete exam schedule by ID
router.delete("/:id", deleteExamSchedule);

export default router;