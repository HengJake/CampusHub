import e from "express";
import {
    createIntakeCourse,
    getAllIntakeCourses,
    getIntakeCourseById,
    updateIntakeCourse,
    deleteIntakeCourse,
    getIntakeCoursesBySchoolId,
    getIntakeCoursesByIntakeId,
    getIntakeCoursesByCourseId,
    getAvailableIntakeCourses,
    updateEnrollmentCount
} from "../../controllers/Academic/intakeCourse.controllers.js";

const router = e.Router();

// Create a new intake course
router.post("/", createIntakeCourse);

// Get all intake courses
router.get("/", getAllIntakeCourses);

// Get available intake courses (not full)
router.get("/available", getAvailableIntakeCourses);

// Get intake course by ID
router.get("/:id", getIntakeCourseById);

// Update intake course by ID
router.put("/:id", updateIntakeCourse);

// Delete intake course by ID
router.delete("/:id", deleteIntakeCourse);

// Update enrollment count
router.patch("/:id/enrollment", updateEnrollmentCount);

// Get intake courses by school ID
router.get("/school/:schoolId", getIntakeCoursesBySchoolId);

// Get intake courses by intake ID
router.get("/intake/:intakeId", getIntakeCoursesByIntakeId);

// Get intake courses by course ID
router.get("/course/:courseId", getIntakeCoursesByCourseId);

export default router; 