import e from "express";
import {
  createStop,
  getAllStops,
  getStopsByType,
  getStopById,
  updateStop,
  deleteStop,
} from "../../controllers/Transportation/stop.controllers.js";

const router = e.Router();

router.post("/", createStop);

router.get("/", getAllStops);

router.get("/type/:type", getStopsByType);

router.get("/:id", getStopById);

router.put("/:id", updateStop);

router.delete("/:id", deleteStop);

export default router;
