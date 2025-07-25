import {
  createRecord,
  getAllRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
  validateMultipleReferences,
  controllerWrapper
} from "../../utils/reusable.js";
import EHailing from "../../models/Transportation/eHailing.model.js";
import Student from "../../models/Academic/student.model.js";
import Route from "../../models/Transportation/route.model.js";
import Stop from "../../models/Transportation/stop.model.js";
import Vehicle from "../../models/Transportation/vehicle.model.js";

const validateEHailingData = async (data) => {
  const { studentId, routeId, status, vehicleId } = data;
  // Required fields
  if (!studentId) return { isValid: false, message: "studentId is required" };
  if (!routeId) return { isValid: false, message: "routeId is required" };
  // Status enum
  if (status && !["waiting", "in_progress", "completed", "cancelled", "delayed"].includes(status)) {
    return { isValid: false, message: "Invalid status value" };
  }
  // Reference validation
  const referenceValidation = await validateMultipleReferences({
    studentId: { id: studentId, Model: Student },
    routeId: { id: routeId, Model: Route },
    ...(vehicleId && { vehicleId: { id: vehicleId, Model: Vehicle } })
  });
  if (referenceValidation) {
    return { isValid: false, message: referenceValidation.message };
  }
  return { isValid: true };
};

export const createEHailing = controllerWrapper(async (req, res) => {
  return await createRecord(EHailing, req.body, "eHailing", validateEHailingData);
});

export const getAllEHailing = controllerWrapper(async (req, res) => {
  return await getAllRecords(EHailing, "eHailing", ["studentId", "routeId", "pickupLocation", "dropOffLocation", "vehicleId"]);
});

export const getEHailingById = controllerWrapper(async (req, res) => {
  const { id } = req.params;
  return await getRecordById(EHailing, id, "eHailing", ["studentId", "routeId", "pickupLocation", "dropOffLocation", "vehicleId"]);
});

// Get EHailings by Student ID
export const getEHailingsByStudentId = controllerWrapper(async (req, res) => {
  const { studentId } = req.params;
  return await getAllRecords(
    EHailing,
    "eHailings",
    ["studentId", "routeId", "pickupLocation", "dropOffLocation", "vehicleId"],
    { studentId: studentId }
  );
});

// Get EHailings by Route ID
export const getEHailingsByRouteId = controllerWrapper(async (req, res) => {
  const { routeId } = req.params;
  return await getAllRecords(
    EHailing,
    "eHailings",
    ["studentId", "routeId", "pickupLocation", "dropOffLocation", "vehicleId"],
    { routeId: routeId }
  );
});

// Get EHailings by Vehicle ID
export const getEHailingsByVehicleId = controllerWrapper(async (req, res) => {
  const { vehicleId } = req.params;
  return await getAllRecords(
    EHailing,
    "eHailings",
    ["studentId", "routeId", "pickupLocation", "dropOffLocation", "vehicleId"],
    { vehicleId: vehicleId }
  );
});

export const updateEHailing = controllerWrapper(async (req, res) => {
  const { id } = req.params;
  return await updateRecord(EHailing, id, req.body, "eHailing", validateEHailingData);
});

export const deleteEHailing = controllerWrapper(async (req, res) => {
  const { id } = req.params;
  return await deleteRecord(EHailing, id, "eHailing");
});

export const deleteAllEHailings = async (req, res) => {
  try {
    await EHailing.deleteMany({});
    res.status(200).json({ message: 'All e-hailing records deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting all e-hailing records', error: error.message });
  }
};


