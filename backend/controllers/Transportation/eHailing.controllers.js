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
  const { StudentID, RouteID, PickupLocation, DropOffLocation, Status, VehicleID } = data;
  // Required fields
  if (!StudentID) return { isValid: false, message: "StudentID is required" };
  if (!RouteID) return { isValid: false, message: "RouteID is required" };
  if (!PickupLocation) return { isValid: false, message: "PickupLocation is required" };
  if (!DropOffLocation) return { isValid: false, message: "DropOffLocation is required" };
  // Status enum
  if (Status && !["pending", "confirmed", "in_progress", "completed", "cancelled"].includes(Status)) {
    return { isValid: false, message: "Invalid status value" };
  }
  // Reference validation
  const referenceValidation = await validateMultipleReferences({
    StudentID: { id: StudentID, Model: Student },
    RouteID: { id: RouteID, Model: Route },
    PickupLocation: { id: PickupLocation, Model: Stop },
    DropOffLocation: { id: DropOffLocation, Model: Stop },
    ...(VehicleID && { VehicleID: { id: VehicleID, Model: Vehicle } })
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
  return await getAllRecords(EHailing, "eHailing", ["StudentID", "RouteID", "PickupLocation", "DropOffLocation", "VehicleID"]);
});

export const getEHailingById = controllerWrapper(async (req, res) => {
  const { id } = req.params;
  return await getRecordById(EHailing, id, "eHailing", ["StudentID", "RouteID", "PickupLocation", "DropOffLocation", "VehicleID"]);
});

// Get EHailings by Student ID
export const getEHailingsByStudentId = controllerWrapper(async (req, res) => {
  const { studentId } = req.params;
  return await getAllRecords(
      EHailing,
      "eHailings",
      ["StudentID", "RouteID", "PickupLocation", "DropOffLocation", "VehicleID"],
      { StudentID: studentId }
  );
});

// Get EHailings by Route ID
export const getEHailingsByRouteId = controllerWrapper(async (req, res) => {
  const { routeId } = req.params;
  return await getAllRecords(
      EHailing,
      "eHailings",
      ["StudentID", "RouteID", "PickupLocation", "DropOffLocation", "VehicleID"],
      { RouteID: routeId }
  );
});

// Get EHailings by Vehicle ID
export const getEHailingsByVehicleId = controllerWrapper(async (req, res) => {
  const { vehicleId } = req.params;
  return await getAllRecords(
      EHailing,
      "eHailings",
      ["StudentID", "RouteID", "PickupLocation", "DropOffLocation", "VehicleID"],
      { VehicleID: vehicleId }
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


