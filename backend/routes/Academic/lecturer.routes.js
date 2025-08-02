import e from "express";
import {
    createLecturer,
    getLecturers,
    getLecturerById,
    updateLecturer,
    deleteLecturer,
    deleteAllLecturers
} from "../../controllers/Academic/lecturer.controllers.js";
import { getLecturersBySchool } from "../../controllers/Academic/lecturer.controllers.js";


const router = e.Router();

// Create a new lecturer
router.post("/", createLecturer);

// Get all lecturers
router.get("/", getLecturers);

// Get lecturer by ID
router.get("/:id", getLecturerById);

// Update lecturer by ID
router.put("/:id", updateLecturer);

// Delete all lecturers
router.delete("/all", deleteAllLecturers);

// Delete lecturer by ID
router.delete("/:id", deleteLecturer);

router.get("/school/:schoolId", getLecturersBySchool);

export default router;