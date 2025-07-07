import e from "express";
import {
    createModule,
    getModules,
    getModuleById,
    updateModule,
    deleteModule
} from "../../controllers/Academic/module.controllers.js";

const router = e.Router();

// Create a new module
router.post("/", createModule);

// Get all modules
router.get("/", getModules);

// Get module by ID
router.get("/:id", getModuleById);

// Update module by ID
router.put("/:id", updateModule);

// Delete module by ID
router.delete("/:id", deleteModule);

export default router;