import e from "express";
import {
    createDepartment,
    getDepartments,
    getDepartmentById,
    updateDepartment,
    deleteDepartment,
    deleteAllDepartments
} from "../../controllers/Academic/department.controllers.js";
import { getDepartmentsBySchool } from "../../controllers/Academic/department.controllers.js";

const router = e.Router();

// Create a new department
router.post("/", createDepartment);

// Get all departments
router.get("/", getDepartments);

// Get department by ID
router.get("/:id", getDepartmentById);

// Update department by ID
router.put("/:id", updateDepartment);

// Delete all departments
router.delete("/all", deleteAllDepartments);

// Delete department by ID
router.delete("/:id", deleteDepartment);

router.get("/school/:schoolId", getDepartmentsBySchool);

export default router;