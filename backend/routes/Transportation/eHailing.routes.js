import express from "express";
import {
  createEHailing,
  getAllEHailing,
  getEHailingById,
  getEHailingsByStudentId,
  getEHailingsByRouteId,
  getEHailingsByVehicleId,
  updateEHailing,
  deleteEHailing
} from "../../controllers/Transportation/eHailing.controllers.js";

const router = express.Router();

router.post("/", createEHailing);
router.get("/", getAllEHailing);
router.get("/student/:studentId", getEHailingsByStudentId);
router.get("/route/:routeId", getEHailingsByRouteId);
router.get("/vehicle/:vehicleId", getEHailingsByVehicleId);
router.get("/:id", getEHailingById);
router.put("/:id", updateEHailing);
router.delete("/:id", deleteEHailing);

export default router; 