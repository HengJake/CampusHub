import express from "express";
import {
  createBusSchedule,
  getAllBusSchedules,
  getBusScheduleById,
  getBusSchedulesByRouteId,
  getBusSchedulesByVehicleId,
  getBusSchedulesBySchoolId,
  updateBusSchedule,
  deleteBusSchedule,
  deleteAllBusSchedules
} from "../../controllers/Transportation/busSchedule.controllers.js";

const router = express.Router();

router.post("/", createBusSchedule);
router.get("/", getAllBusSchedules);
router.get("/route/:routeID", getBusSchedulesByRouteId);
router.get("/vehicle/:vehicleID", getBusSchedulesByVehicleId);
router.get("/school/:schoolId", getBusSchedulesBySchoolId);
router.get("/:id", getBusScheduleById);
router.put("/:id", updateBusSchedule);
router.delete('/all', deleteAllBusSchedules);
router.delete("/:id", deleteBusSchedule);

export default router;
