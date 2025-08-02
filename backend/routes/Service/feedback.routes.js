import express from "express";
import { userAuth } from "../../utils/authMiddleware.js";
import {
  createFeedback,
  getAllFeedbacks,
  getFeedbackById,
  getFeedbacksByStudentId,
  getFeedbacksByFeedbackType,
  updateFeedback,
  deleteFeedback,
  deleteAllFeedbacks
} from "../../controllers/Service/feedback.controllers.js";

const router = express.Router();

// router.post("/", userAuth, createFeedback);
router.post("/", createFeedback);
router.get("/", getAllFeedbacks);
router.get("/:id", getFeedbackById);
router.get("/student/:studentId", getFeedbacksByStudentId);
router.get("/type/:feedbackType", getFeedbacksByFeedbackType);
router.put("/:id", updateFeedback);
router.delete('/all', deleteAllFeedbacks);
router.delete("/:id", deleteFeedback);

export default router; 