import e from "express";
import { createSchool } from "../../controllers/Billing/school.controllers.js";

const router = e.Router();

router.post("/", createSchool);

export default router;