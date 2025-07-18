import express from "express";
import {
  createParkingLot,
  getAllParkingLots,
  getParkingLotById,
  getParkingLotsBySchoolId,
  updateParkingLot,
  deleteParkingLot,
  deleteAllParkingLots
} from "../../controllers/Facility/parkingLot.controllers.js";

const router = express.Router();

router.post("/", createParkingLot);
router.get("/", getAllParkingLots);
router.get("/school/:schoolId", getParkingLotsBySchoolId);
router.get("/:id", getParkingLotById);
router.put("/:id", updateParkingLot);
router.delete('/all', deleteAllParkingLots);
router.delete("/:id", deleteParkingLot);

export default router; 