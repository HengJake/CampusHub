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
  if (status && !['pending', 'approved', 'rejected', 'cancelled'].includes(status)) return { isValid: false, message: "Invalid status value" };
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

export const updateBooking = controllerWrapper(async (req, res) => {
  const { id } = req.params;
  return await updateRecord(Booking, id, req.body, "booking", validateBookingData);
});

export const deleteBooking = controllerWrapper(async (req, res) => {
  const { id } = req.params;
  return await deleteRecord(Booking, id, "booking");
}); 