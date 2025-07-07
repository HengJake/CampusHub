import e from "express";
import {
    createCourse,
    getCourses,
    getCourseById,
    updateCourse,
    deleteCourse
} from "../../controllers/Academic/course.controllers.js";

const router = e.Router();

// Create a new course
router.post("/", createCourse);

// Get all courses
router.get("/", getCourses);

// Get course by ID
router.get("/:id", getCourseById);

// Update course by ID
router.put("/:id", updateCourse);

// Delete course by ID
router.delete("/:id", deleteCourse);

export default router;