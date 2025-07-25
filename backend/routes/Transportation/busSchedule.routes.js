import express from "express";
import {
  createBusSchedule,
  getAllBusSchedules,
  getBusScheduleById,
  getBusSchedulesByRouteId,
  getBusSchedulesByVehicleId,
  updateBusSchedule,
  deleteBusSchedule,
  deleteAllBusSchedules
} from "../../controllers/Transportation/busSchedule.controllers.js";

const router = express.Router();

router.post("/", createBusSchedule);
router.get("/", getAllBusSchedules);
router.get("/route/:routeId", getBusSchedulesByRouteId);
router.get("/vehicle/:vehicleId", getBusSchedulesByVehicleId);
router.get("/:id", getBusScheduleById);
router.put("/:id", updateBusSchedule);
router.delete('/all', deleteAllBusSchedules);
router.delete("/:id", deleteBusSchedule);

export default router;
