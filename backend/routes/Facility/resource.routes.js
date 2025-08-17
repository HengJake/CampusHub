import express from "express";
import {
  createResource,
  getAllResource,
  getResourceById,
  getResourcesBySchoolId,
  getFacilitiesBySchoolId,
  updateResource,
  deleteResource,
  deleteAllResources,
  getAvailableTimeslots
} from "../../controllers/Facility/resource.controllers.js";

const router = express.Router();

router.post("/", createResource);
router.get("/", getAllResource);
router.get("/school/:schoolId", getResourcesBySchoolId);
router.get("/facilities/school/:schoolId", getFacilitiesBySchoolId);
router.get("/available/:resourceId/:dayOfWeek", getAvailableTimeslots);
router.get("/:id", getResourceById);
router.get("/:id/school/:schoolId", getResourceById);
router.put("/:id", updateResource);
router.delete('/all', deleteAllResources);
router.delete("/:id", deleteResource);

export default router;
