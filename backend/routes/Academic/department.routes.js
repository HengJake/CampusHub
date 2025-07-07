import e from "express";
import {
    createDepartment,
    getDepartments,
    getDepartmentById,
    updateDepartment,
    deleteDepartment
} from "../../controllers/Academic/department.controllers.js";

const router = e.Router();

// Create a new department
router.post("/", createDepartment);

// Get all departments
router.get("/", getDepartments);

// Get department by ID
router.get("/:id", getDepartmentById);

// Update department by ID
router.put("/:id", updateDepartment);

// Delete department by ID
router.delete("/:id", deleteDepartment);

export default router;