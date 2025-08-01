import {
  createRecord,
  getAllRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
  validateReferenceExists,
  controllerWrapper
} from "../../utils/reusable.js";
import Timeslot from "../../models/Facility/timeSlot.model.js";
import Resource from "../../models/Facility/resource.model.js";

const validateTimeslotData = async (data) => {
  const { resourceId, dayOfWeek, timeslot } = data;
  if (!resourceId) return { isValid: false, message: "resourceId is required" };
  if (dayOfWeek == null) return { isValid: false, message: "dayOfWeek is required" };
  if (!Array.isArray(timeslot) || timeslot.length === 0) return { isValid: false, message: "timeslot array is required" };
  const referenceValidation = await validateReferenceExists(resourceId, Resource, "resourceId");
  if (referenceValidation) {
    return { isValid: false, message: referenceValidation.message };
  }
  return { isValid: true };
};

export const createTimeslot = controllerWrapper(async (req, res) => {
  return await createRecord(Timeslot, req.body, "timeslot", validateTimeslotData);
});

export const getAllTimeslots = controllerWrapper(async (req, res) => {
  return await getAllRecords(Timeslot, "timeslot", ["resourceId"]);
});

export const getTimeslotById = controllerWrapper(async (req, res) => {
  const { id } = req.params;
  return await getRecordById(Timeslot, id, "timeslot", ["resourceId"]);
});


// Get Timeslots by Resource ID
export const getTimeslotsByResourceId = controllerWrapper(async (req, res) => {
  const { resourceId } = req.params;
  return await getAllRecords(
    Timeslot,
    "timeslots",
    ["resourceId"],
    { resourceId }
  );
});

export const updateTimeslot = controllerWrapper(async (req, res) => {
  const { id } = req.params;
  return await updateRecord(Timeslot, id, req.body, "timeslot", validateTimeslotData);
});

export const deleteTimeslot = controllerWrapper(async (req, res) => {
  const { id } = req.params;
  return await deleteRecord(Timeslot, id, "timeslot");
});

export const deleteAllTimeSlots = async (req, res) => {
  try {
    await Timeslot.deleteMany({});
    res.status(200).json({ message: 'All time slots deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting all time slots', error: error.message });
  }
};