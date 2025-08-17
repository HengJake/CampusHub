import e from "express";
import {
    createExamSchedule,
    getExamSchedules,
    getExamScheduleById,
    updateExamSchedule,
    deleteExamSchedule,
    deleteAllExamSchedules
} from "../../controllers/Academic/examSchedule.controllers.js";
import { getExamSchedulesBySchoolId } from "../../controllers/Academic/examSchedule.controllers.js";

const router = e.Router();

// Create a new exam schedule
router.post("/", createExamSchedule);

// Get all exam schedules
router.get("/", getExamSchedules);

// Get exam schedule by ID
router.get("/:id", getExamScheduleById);

// Update exam schedule by ID
router.put("/:id", updateExamSchedule);

// Delete all examSchedules
router.delete("/all", deleteAllExamSchedules);

// Delete examSchedule by ID
router.delete("/:id", deleteExamSchedule);

router.get("/school/:schoolId", getExamSchedulesBySchoolId);

export default router;