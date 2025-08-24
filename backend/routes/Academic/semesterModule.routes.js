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
    getAvailableModulesForSemester
} from "../../controllers/Academic/semesterModule.controllers.js";

const router = express.Router();

// Get all semester modules by school ID
router.get("/school/:schoolId", getSemesterModulesBySchoolId);

// Get modules for a specific semester
router.get("/semester/:semesterId", getModulesBySemester);

// Get semesters for a specific module
router.get("/module/:moduleId", getSemestersByModule);

// Get module count for a semester
router.get("/count/:semesterId", getModuleCountBySemester);

// Get available modules for a semester
router.get("/available/:semesterId/:courseId/:schoolId", getAvailableModulesForSemester);

// Add module to semester
router.post("/", addModuleToSemester);

// Get semester module by ID
router.get("/:id", getSemesterModuleById);

// Update semester module
router.put("/:id", updateSemesterModule);

// Remove module from semester
router.delete("/:id", removeModuleFromSemester);

export default router;
