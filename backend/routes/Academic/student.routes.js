import e from "express";
import {
    createStudent,
    getAllStudents,
    getStudentById,
    updateStudent,
    deleteStudent,
    getStudentsBySchoolId,
    getStudentsByIntakeCourseId,
    getStudentsByYear
} from "../../controllers/Academic/student.controllers.js";

const router = e.Router();

// Create a new student
router.post("/", createStudent);

// Get all students
router.get("/", getAllStudents);

// Get student by ID
router.get("/:id", getStudentById);

// Update student by ID
router.put("/:id", updateStudent);

// Delete student by ID
router.delete("/:id", deleteStudent);

// Get students by school ID
router.get("/school/:schoolId", getStudentsBySchoolId);

// Get students by intakeCourseId (main filter for course+intake)
router.get("/intake-course/:intakeCourseId", getStudentsByIntakeCourseId);

// Get students by year
router.get("/year/:year", getStudentsByYear);

export default router;