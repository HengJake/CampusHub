import e from "express";
import {
    createClassSchedule,
    getClassSchedules,
    getClassScheduleById,
    updateClassSchedule,
    deleteClassSchedule,
    deleteAllClassSchedules
} from "../../controllers/Academic/classSchedule.controllers.js";
import { getClassSchedulesBySchool } from "../../controllers/Academic/classSchedule.controllers.js";

const router = e.Router();

// Create a new class schedule
router.post("/", createClassSchedule);

// Get all class schedules
router.get("/", getClassSchedules);

// Get class schedule by ID
router.get("/:id", getClassScheduleById);

// Update class schedule by ID
router.put("/:id", updateClassSchedule);

// Delete all classSchedules
router.delete("/all", deleteAllClassSchedules);

// Delete classSchedule by ID
router.delete("/:id", deleteClassSchedule);

router.get("/school/:schoolId", getClassSchedulesBySchool);

export default router;