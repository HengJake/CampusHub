import express from "express";
import {
  createLockerUnit,
  getAllLockerUnit,
  getLockerUnitById,
  getLockerUnitsByResourceId,
  updateLockerUnit,
  deleteLockerUnit
} from "../../controllers/Facility/lockerUnit.controllers.js";

const router = express.Router();

router.post("/", createLockerUnit);
router.get("/", getAllLockerUnit);
router.get("/resource/:resourceId", getLockerUnitsByResourceId);
router.get("/:id", getLockerUnitById);
router.put("/:id", updateLockerUnit);
router.delete("/:id", deleteLockerUnit);

export default router; 