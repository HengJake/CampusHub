import express from "express";
import {
  createRespond,
  getAllResponds,
  getRespondById,
  getRespondsByFeedbackId,
  getRespondsBySchoolId,
  updateRespond,
  deleteRespond,
  deleteAllResponds
} from "../../controllers/Service/respond.controllers.js";

const router = express.Router();

router.post("/", createRespond);
router.get("/", getAllResponds);
router.get("/feedback/:feedbackId", getRespondsByFeedbackId);
router.get("/school/:schoolId", getRespondsBySchoolId);
router.get("/:id", getRespondById);
router.put("/:id", updateRespond);
router.delete("/all", deleteAllResponds);
router.delete("/:id", deleteRespond);

export default router; 