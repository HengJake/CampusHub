import express from "express";
import {
  createRespond,
  getAllResponds,
  getRespondById,
  getRespondsByFeedbackId,
  updateRespond,
  deleteRespond,
  deleteAllResponds
} from "../../controllers/Service/respond.controllers.js";

const router = express.Router();

router.post("/", createRespond);
router.get("/", getAllResponds);
router.get("/:id", getRespondById);
router.get("/feedback/:feedbackId", getRespondsByFeedbackId);
router.put("/:id", updateRespond);
router.delete("/all", deleteAllResponds);
router.delete("/:id", deleteRespond);

export default router; 