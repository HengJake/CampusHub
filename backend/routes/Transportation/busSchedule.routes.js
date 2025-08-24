// Programmer Name : Ritchie Boon Win Yew, Backend Developer
// Program Name: busSchedule.routes.js
// Description: Bus schedule route definitions for transportation timetable management, route scheduling, and schedule updates
// First Written on: July 17, 2024
// Edited on: Friday, July 19, 2024

import express from "express";
import {
  createBusSchedule,
  getAllBusSchedules,
  getBusScheduleById,
  getBusSchedulesByRouteId,
  getBusSchedulesByVehicleId,
  getBusSchedulesBySchoolId,
  getBusSchedulesByStudentId,
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
router.get("/student/:studentId", getBusSchedulesByStudentId);
router.get("/:id", getBusScheduleById);
router.put("/:id", updateBusSchedule);
router.delete('/all', deleteAllBusSchedules);
router.delete("/:id", deleteBusSchedule);

export default router;
