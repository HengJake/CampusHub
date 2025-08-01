import {
  createRecord,
  getAllRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
  validateMultipleReferences,
  controllerWrapper
} from "../../utils/reusable.js";
import Booking from "../../models/Facility/booking.model.js";
import Student from "../../models/Academic/student.model.js";
import Resource from "../../models/Facility/resource.model.js";

const validateBookingData = async (data) => {
  const { studentId, resourceId, startTime, endTime, status } = data;
  if (!studentId) return { isValid: false, message: "studentId is required" };
  if (!resourceId) return { isValid: false, message: "resourceId is required" };
  if (!startTime) return { isValid: false, message: "startTime is required" };
  if (!endTime) return { isValid: false, message: "endTime is required" };
  if (status && !['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) return { isValid: false, message: "Invalid status value" };
  const referenceValidation = await validateMultipleReferences({
    studentId: { id: studentId, Model: Student },
    resourceId: { id: resourceId, Model: Resource }
  });
  if (referenceValidation) {
    return { isValid: false, message: referenceValidation.message };
  }
  return { isValid: true };
};

export const createBooking = controllerWrapper(async (req, res) => {
  return await createRecord(Booking, req.body, "booking", validateBookingData);
});

export const getAllBookings = controllerWrapper(async (req, res) => {
  return await getAllRecords(Booking, "booking", ["studentId", "resourceId"]);
});

export const getBookingById = controllerWrapper(async (req, res) => {
  const { id } = req.params;
  return await getRecordById(Booking, id, "booking", ["studentId", "resourceId"]);
});

// Get Bookings by Student ID
export const getBookingsByStudentId = controllerWrapper(async (req, res) => {
  const { studentId } = req.params;
  return await getAllRecords(
    Booking,
    "bookings",
    ["studentId", "resourceId"],
    { studentId }
  );
});

// Get Bookings by Resource ID
export const getBookingsByResourceId = controllerWrapper(async (req, res) => {
  const { resourceId } = req.params;
  return await getAllRecords(
    Booking,
    "bookings",
    ["studentId", "resourceId"],
    { resourceId }
  );
});

export const getBookingsBySchoolId = controllerWrapper(async (req, res) => {
  const { schoolId } = req.params;
  return await getAllRecords(
    Booking,
    "bookings",
    ["studentId", "resourceId"],
    { schoolId }
  );
});

export const updateBooking = controllerWrapper(async (req, res) => {
  const { id } = req.params;
  return await updateRecord(Booking, id, req.body, "booking", validateBookingData);
});

export const deleteBooking = controllerWrapper(async (req, res) => {
  const { id } = req.params;
  return await deleteRecord(Booking, id, "booking");
});

export const deleteAllBookings = async (req, res) => {
  try {
    await Booking.deleteMany({});
    res.status(200).json({ message: 'All bookings deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting all bookings', error: error.message });
  }
};
