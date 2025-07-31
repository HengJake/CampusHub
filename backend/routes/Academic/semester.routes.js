import express from "express";
import {
    createSemester,
    getSemesters,
    getSemestersBySchoolId,
    getSemestersByIntakeCourse,
    getSemesterById,
    updateSemester,
    deleteSemester,
    getCurrentSemester,
    getUpcomingSemesters,
    updateSemesterStatus
} from "../../controllers/Academic/semester.controllers.js";

const router = express.Router();

// Base routes
router.post("/", createSemester);
router.get("/", getSemesters);
router.get("/:id", getSemesterById);
router.put("/:id", updateSemester);
router.delete("/:id", deleteSemester);

// School-specific routes
router.get("/school/:schoolId", getSemestersBySchoolId);
router.get("/school/:schoolId/upcoming", getUpcomingSemesters);

// Intake course-specific routes
router.get("/intake-course/:intakeCourseId", getSemestersByIntakeCourse);
router.get("/intake-course/:intakeCourseId/current", getCurrentSemester);

// Status management
router.patch("/:id/status", updateSemesterStatus);

export default router;