import express from "express";
import { userAuth } from "../../utils/authMiddleware.js";
import {
    createBugReport,
    getAllBugReports,
    getBugReportById,
    getBugReportsBySchoolId,
    getBugReportsByUserId,
    getBugReportsBySchoolAndUser,
    updateBugReport,
    deleteBugReport
} from "../../controllers/Service/bugReport.controllers.js";

const router = express.Router();

// Create bug report
router.post("/", createBugReport);

// Get all bug reports
router.get("/", getAllBugReports);

// Get bug reports by school ID
router.get("/school/:schoolId", getBugReportsBySchoolId);

// Get bug reports by user ID
router.get("/user/:userId", getBugReportsByUserId);

// Get bug reports by school and user
router.get("/school/:schoolId/user/:userId", getBugReportsBySchoolAndUser);

// Get bug report by ID
router.get("/:id", getBugReportById);

// Update bug report
router.put("/:id", updateBugReport);

// Delete bug report
router.delete("/:id", deleteBugReport);

export default router;
