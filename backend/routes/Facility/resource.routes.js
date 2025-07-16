import express from "express";
import {
  createResource,
  getAllResource,
  getResourceById,
  getResourcesBySchoolId,
  updateResource,
  deleteResource
} from "../../controllers/Facility/resource.controllers.js";

const router = express.Router();

router.post("/", createResource);
router.get("/", getAllResource);
router.get("/school/:schoolID", getResourcesBySchoolId);
router.get("/:id", getResourceById);
router.put("/:id", updateResource);
router.delete("/:id", deleteResource);

export default router;
