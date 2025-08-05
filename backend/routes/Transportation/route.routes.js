import express from "express";
import {
  createRoute,
  getAllRoutes,
  getRouteById,
  getRoutesByStopId,
  getRoutesBySchoolId,
  updateRoute,
  deleteRoute,
  deleteAllRoutes
} from "../../controllers/Transportation/route.controllers.js";

const router = express.Router();

router.post("/", createRoute);
router.get("/", getAllRoutes);
router.get("/stop/:stopId", getRoutesByStopId);
router.get("/school/:schoolId", getRoutesBySchoolId);
router.get("/:id", getRouteById);
router.put("/:id", updateRoute);
router.delete('/all', deleteAllRoutes);
router.delete("/:id", deleteRoute);

export default router; 