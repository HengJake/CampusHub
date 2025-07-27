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

router.post("/", userAuth, createFeedback);
router.get("/", userAuth, getAllFeedbacks);
router.get("/:id", userAuth, getFeedbackById);
router.get("/student/:studentId", userAuth, getFeedbacksByStudentId);
router.get("/type/:feedbackType", userAuth, getFeedbacksByFeedbackType);
router.put("/:id", userAuth, updateFeedback);
router.delete('/all', userAuth, deleteAllFeedbacks);
router.delete("/:id", userAuth, deleteFeedback);

export default router; 