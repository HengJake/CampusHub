import express from "express";
import {
  createVehicle,
  getAllVehicles,
  getVehicleById,
  getVehiclesBySchoolId,
  updateVehicle,
  deleteVehicle,
  deleteAllVehicles
} from "../../controllers/Transportation/vehicle.controllers.js";

const router = express.Router();

router.post("/", createVehicle);
router.get("/", getAllVehicles);
router.get("/school/:schoolId", getVehiclesBySchoolId);
router.get("/:id", getVehicleById);
router.put("/:id", updateVehicle);
router.delete('/all', deleteAllVehicles);
router.delete("/:id", deleteVehicle);

export default router;
