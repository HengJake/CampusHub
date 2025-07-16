import express from "express";
import {
  createRespond,
  getAllResponds,
  getRespondById,
  getRespondsByFeedbackId,
  updateRespond,
  deleteRespond
} from "../../controllers/Service/respond.controllers.js";

const router = express.Router();

router.post("/", createRespond);
router.get("/", getAllResponds);
router.get("/:id", getRespondById);
router.get("/feedback/:feedbackId", getRespondsByFeedbackId);
router.put("/:id", updateRespond);
router.delete("/:id", deleteRespond);

export default router; 