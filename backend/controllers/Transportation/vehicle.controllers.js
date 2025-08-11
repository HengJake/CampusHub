import {
  createRecord,
  getAllRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
  controllerWrapper,
  validateUniqueField
} from "../../utils/reusable.js";
import Vehicle from "../../models/Transportation/vehicle.model.js";

const validateVehicleData = async (data) => {
  const { plateNumber, type, capacity, status } = data;
  if (!plateNumber) return { isValid: false, message: "plateNumber is required" };
  if (!type) return { isValid: false, message: "type is required" };
  if (!capacity) return { isValid: false, message: "capacity is required" };
  if (!["bus", "car"].includes(type)) return { isValid: false, message: "type must be either 'bus' or 'car'" };
  if (status && !["available", "in_service", "under_maintenance", "inactive"].includes(status)) return { isValid: false, message: "Invalid status value" };
  if (capacity < 1) return { isValid: false, message: "capacity must be at least 1" };
  return { isValid: true };
};

export const createVehicle = controllerWrapper(async (req, res) => {
  return await createRecord(Vehicle, req.body, "vehicle", validateVehicleData, ["plateNumber"]);
});

export const getAllVehicles = controllerWrapper(async (req, res) => {
  return await getAllRecords(Vehicle, "vehicle");
});

export const getVehicleById = controllerWrapper(async (req, res) => {
  const { id } = req.params;
  return await getRecordById(Vehicle, id, "vehicle");
});

// Get Vehicles by School ID
export const getVehiclesBySchoolId = controllerWrapper(async (req, res) => {
  const { schoolId } = req.params;
  return await getAllRecords(Vehicle, "vehicle", [], { schoolId: schoolId });
});

export const updateVehicle = controllerWrapper(async (req, res) => {
  const { id } = req.params;
  return await updateRecord(Vehicle, id, req.body, "vehicle", validateVehicleData);
});

export const deleteVehicle = controllerWrapper(async (req, res) => {
  const { id } = req.params;
  return await deleteRecord(Vehicle, id, "vehicle");
});

export const deleteAllVehicles = controllerWrapper(async (req, res) => {
  const result = await Vehicle.deleteMany({});
  return {
    success: true,
    data: { deletedCount: result.deletedCount },
    message: `${result.deletedCount} vehicles deleted successfully`,
    statusCode: 200
  };
});
