import express from "express";
import {
  createStop,
  getAllStops,
  getStopsByType,
  getStopById,
  updateStop,
  deleteStop,
  deleteAllStops
} from "../../controllers/Transportation/stop.controllers.js";

const router = express.Router();

router.post("/", createStop);
router.get("/", getAllStops);
router.get("/type/:type", getStopsByType);
router.get("/:id", getStopById);
router.put("/:id", updateStop);
router.delete('/all', deleteAllStops);
router.delete("/:id", deleteStop);

export default router;
