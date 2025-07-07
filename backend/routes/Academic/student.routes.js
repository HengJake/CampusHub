import e from "express";
import {
    createStudent,
    getAllStudents,
    getStudentById,
    updateStudentById,
    deleteStudentById,
    getStudentsBySchoolId,
    getStudentsByIntakeID,
    getStudentsByCourseId,
    getStudentsByYear
} from "../../controllers/Academic/student.controllers.js";

const router = e.Router();

// Create a new student
router.post("/", createStudent);

// Get all students
router.get("/", getAllStudents);

// Get student by ID
router.get("/:UserID", getStudentById);

// Update student by ID
router.put("/:UserID", updateStudentById);

// Delete student by ID
router.delete("/:UserID", deleteStudentById);

// Get students by school ID
router.get("/school/:SchoolID", getStudentsBySchoolId);

// Get students by intake ID
router.get("/intake/:IntakeID", getStudentsByIntakeID);

// Get students by course ID
router.get("/course/:CourseID", getStudentsByCourseId);

// Get students by year
router.get("/year/:year", getStudentsByYear);

export default router;