import express from "express";
import {
  createBooking,
  getAllBookings,
  getBookingById,
  getBookingsByStudentId,
  getBookingsByResourceId,
  updateBooking,
  deleteBooking,
  deleteAllBookings,
  getBookingsBySchoolId
} from "../../controllers/Facility/booking.controllers.js";

const router = express.Router();

router.post("/", createBooking);
router.get("/", getAllBookings);
router.get("/school/:schoolId", getBookingsBySchoolId);
router.get("/student/:studentId", getBookingsByStudentId);
router.get("/resource/:resourceId", getBookingsByResourceId);
router.get("/:id", getBookingById);
router.put("/:id", updateBooking);
router.delete('/all', deleteAllBookings);
router.delete("/:id", deleteBooking);

export default router; 