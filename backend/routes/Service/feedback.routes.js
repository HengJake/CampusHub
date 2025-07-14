import express from "express";
import {
  createFeedback,
  getAllFeedbacks,
  getFeedbackById,
  getFeedbacksByStudentId,
  getFeedbacksByFeedbackType,
  updateFeedback,
  deleteFeedback
} from "../../controllers/Service/feedback.controllers.js";

const router = express.Router();

router.post("/", createFeedback);
router.get("/", getAllFeedbacks);
router.get("/:id", getFeedbackById);
router.get("/student/:studentId", getFeedbacksByStudentId);
router.get("/type/:feedbackType", getFeedbacksByFeedbackType);
router.put("/:id", updateFeedback);
router.delete("/:id", deleteFeedback);

export default router; 