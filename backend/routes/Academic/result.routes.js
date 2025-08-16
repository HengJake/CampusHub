import e from "express";
import {
    createResult,
    getAllResults,
    getResultById,
    updateResult,
    deleteResult,
    getResultsByStudentId,
    getResultsByModuleId,
    getResultsBySemesterId,
    getResultsByGrade,
    getStudentGPA,
    getModuleStatistics,
    getSemesterStatistics,
    deleteAllResults,
    getResultsBySchoolId
} from "../../controllers/Academic/result.controllers.js";

const router = e.Router();

// Create a new result
router.post("/", createResult);

// Get all results
router.get("/", getAllResults);

// Get result by ID
router.get("/:id", getResultById);

// Update result by ID
router.put("/:id", updateResult);

// Delete all results
router.delete("/all", deleteAllResults);

// Delete result by ID
router.delete("/:id", deleteResult);

// Get results by student ID
router.get("/student/:studentId", getResultsByStudentId);

// Get results by module ID
router.get("/module/:moduleId", getResultsByModuleId);

// Get results by semester ID
router.get("/semester/:semesterId", getResultsBySemesterId);

// Get results by grade
router.get("/grade/:grade", getResultsByGrade);

// Get student GPA
router.get("/gpa/:studentId", getStudentGPA);

// Get module statistics
router.get("/statistics/:moduleId", getModuleStatistics);

// Get semester statistics
router.get("/semester-statistics/:semesterId", getSemesterStatistics);

router.get("/school/:schoolId", getResultsBySchoolId);


export default router;