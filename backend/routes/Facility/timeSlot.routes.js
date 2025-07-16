import express from "express";
import {
  createTimeslot,
  getAllTimeslots,
  getTimeslotById,
  getTimeslotsByResourceId,
  updateTimeslot,
  deleteTimeslot
} from "../../controllers/Facility/timeSlot.controllers.js";

const router = express.Router();

router.post("/", createTimeslot);
router.get("/", getAllTimeslots);
router.get("/resource/:resourceId", getTimeslotsByResourceId);
router.get("/:id", getTimeslotById);
router.put("/:id", updateTimeslot);
router.delete("/:id", deleteTimeslot);

export default router; 