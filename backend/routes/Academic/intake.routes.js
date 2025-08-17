import e from "express";
import {
    createIntake,
    getIntakes,
    getIntakeById,
    updateIntake,
    deleteIntake,
    deleteAllIntakes
} from "../../controllers/Academic/intake.controllers.js";
import { getIntakesBySchoolId } from "../../controllers/Academic/intake.controllers.js";

const router = e.Router();

// Create a new intake
router.post("/", createIntake);

// Get all intakes
router.get("/", getIntakes);

// Get intake by ID
router.get("/:id", getIntakeById);

// Update intake by ID
router.put("/:id", updateIntake);

// Delete all intakes
router.delete("/all", deleteAllIntakes);

// Delete intake by ID
router.delete("/:id", deleteIntake);

router.get("/school/:schoolId", getIntakesBySchoolId);

export default router;