import e from "express";
import { createSchool,  deleteSchool} from "../../controllers/Billing/school.controllers.js";

const router = e.Router();

router.post("/", createSchool);

router.delete("/:id", deleteSchool);

export default router;