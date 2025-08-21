import express from "express";
import {
  createParkingLot,
  getAllParkingLots,
  getParkingLotById,
  getParkingLotsBySchoolId,
  updateParkingLot,
  deleteParkingLot,
  deleteAllParkingLots,
  bulkCreateParkingLots,
  getExistingSlotNumbers,
  checkForDuplicates,
  cleanupDuplicates
} from "../../controllers/Facility/parkingLot.controllers.js";

const router = express.Router();

router.post("/", createParkingLot);
router.post("/bulk", bulkCreateParkingLots);
router.get("/", getAllParkingLots);
router.get("/existing-slots", getExistingSlotNumbers);
router.get("/check-duplicates", checkForDuplicates);
router.delete("/cleanup-duplicates", cleanupDuplicates);
router.get("/school/:schoolId", getParkingLotsBySchoolId);
router.get("/:id", getParkingLotById);
router.put("/:id", updateParkingLot);
router.delete('/all', deleteAllParkingLots);
router.delete("/:id", deleteParkingLot);

export default router; 