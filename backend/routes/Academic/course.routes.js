import e from "express";
import {
    createCourse,
    getCourses,
    getCourseById,
    updateCourse,
    deleteCourse,
    deleteAllCourses
} from "../../controllers/Academic/course.controllers.js";
import { getCoursesBySchool } from "../../controllers/Academic/course.controllers.js";

const router = e.Router();

// Create a new course
router.post("/", createCourse);

// Get all courses
router.get("/", getCourses);

// Get course by ID
router.get("/:id", getCourseById);

// Update course by ID
router.put("/:id", updateCourse);

// Delete all courses
router.delete("/all", deleteAllCourses);

// Delete course by ID
router.delete("/:id", deleteCourse);

router.get("/school/:schoolId", getCoursesBySchool);

export default router;