import e from "express";
import {
    createSchool,
    getAllSchool,
    getSchoolById,
    updateSchool,
    deleteSchool,
    getSchoolByUserId,
    deleteAllSchools
} from "../../controllers/Billing/school.controllers.js";

const router = e.Router();

// Create a new school
router.post("/", createSchool);

// Get all schools
router.get("/", getAllSchool);

// Get school by ID
router.get("/:id", getSchoolById);

router.get("/user/:id", getSchoolByUserId);

// Update school by ID
router.put("/:id", updateSchool);

router.delete("/all", deleteAllSchools);

// Delete school by ID
router.delete("/:id", deleteSchool);

export default router;