import e from "express";
import {
    createLecturer,
    getLecturers,
    getLecturerById,
    updateLecturer,
    deleteLecturer
} from "../../controllers/Academic/lecturer.controllers.js";

const router = e.Router();

// Create a new lecturer
router.post("/", createLecturer);

// Get all lecturers
router.get("/", getLecturers);

// Get lecturer by ID
router.get("/:id", getLecturerById);

// Update lecturer by ID
router.put("/:id", updateLecturer);

// Delete lecturer by ID
router.delete("/:id", deleteLecturer);

export default router;