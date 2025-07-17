import e from "express";
import {
    createStudent,
    getAllStudents,
    getStudentById,
    updateStudent,
    deleteStudent,
    getStudentsBySchool,
    getStudentsByIntakeCourseId,
    getStudentsByYear,
    deleteAllStudents,
    getStudentsByUser
} from "../../controllers/Academic/student.controllers.js";
import { userAuth, authRole } from "../../utils/authMiddleware.js";

const router = e.Router();

// Create a new student (both roles can create)
router.post("/", userAuth, authRole(["companyAdmin", "schoolAdmin"]), createStudent);
// router.post("/", createStudent);

// Get all students (company admin only)
// router.get("/", userAuth, authRole("companyAdmin"), getAllStudents);
router.get("/", getAllStudents);

// Get student by ID (both roles)
// router.get("/:id", userAuth, authRole(["companyAdmin", "schoolAdmin"]), getStudentById);
router.get("/:id", getStudentById);

// Update student by ID (both roles)
// router.put("/:id", userAuth, authRole(["companyAdmin", "schoolAdmin"]), updateStudent);
router.put("/:id", updateStudent);

// Delete all students (company admin only)
// router.delete("/all", userAuth, authRole("companyAdmin"), deleteAllStudents);
router.delete("/all", deleteAllStudents);

// Delete student by ID (both roles)
// router.delete("/:id", userAuth, authRole(["companyAdmin", "schoolAdmin"]), deleteStudent);
router.delete("/:id", deleteStudent);

// Get students by school ID (school admin only, but company admin can also access)
// router.get("/school/:schoolId", userAuth, authRole(["companyAdmin", "schoolAdmin"]), getStudentsBySchool);
router.get("/school/:schoolId", getStudentsBySchool);

// Get students by intakeCourseId (main filter for course+intake)
router.get("/intake-course/:intakeCourseId", getStudentsByIntakeCourseId);

// Get students by year
router.get("/year/:year", getStudentsByYear);

router.get("/user/:userId", getStudentsByUser);

export default router;