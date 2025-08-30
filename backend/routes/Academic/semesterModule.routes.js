import express from "express";
import {
    getSemesterModulesBySchoolId,
    getModulesBySemester,
    getSemestersByModule,
    addModuleToSemester,
    removeModuleFromSemester,
    getSemesterModuleById,
    updateSemesterModule,
    getModuleCountBySemester,
    getAvailableModulesForSemester,
    getSemesterModulesByIntakeCourse,
    getSemesterModulesByIntakeCourseAndYear,
    bulkAddModulesToSemester,
    deleteAllSemesterModules
} from "../../controllers/Academic/semesterModule.controllers.js";

const router = express.Router();

// Get all semester modules by school ID
router.get("/school/:schoolId", getSemesterModulesBySchoolId);

// Delete all semester modules for a school
router.delete("/all", deleteAllSemesterModules);

// Get modules for a specific semester
router.get("/semester/:semesterId", getModulesBySemester);

// Get semesters for a specific module
router.get("/module/:moduleId", getSemestersByModule);

// Get module count for a semester
router.get("/count/:semesterId", getModuleCountBySemester);

// Get available modules for a semester
router.get("/available/:semesterId/:intakeCourseId/:schoolId", getAvailableModulesForSemester);

// Get semester modules by intake course
router.get("/intake-course/:intakeCourseId/school/:schoolId", getSemesterModulesByIntakeCourse);

// Get semester modules by intake course and year
router.get("/intake-course/:intakeCourseId/year/:academicYear/school/:schoolId", getSemesterModulesByIntakeCourseAndYear);

// Add module to semester
router.post("/", addModuleToSemester);

// Bulk add modules to semester
router.post("/bulk", bulkAddModulesToSemester);

// Get semester module by ID
router.get("/:id", getSemesterModuleById);

// Update semester module
router.put("/:id", updateSemesterModule);

// Remove module from semester
router.delete("/:id", removeModuleFromSemester);

export default router;
