import {
  createRecord,
  getAllRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
  validateMultipleReferences,
  controllerWrapper
} from "../../utils/reusable.js";
import BusSchedule from "../../models/Transportation/busShcedule.model.js";
import Route from "../../models/Transportation/route.model.js";
import Vehicle from "../../models/Transportation/vehicle.model.js";

const validateBusScheduleData = async (data) => {
  const { RouteID, VehicleID, DepartureTime, ArrivalTime, DayActive } = data;
  if (!RouteID || !Array.isArray(RouteID) || RouteID.length === 0) return { isValid: false, message: "RouteID array is required" };
  if (!VehicleID) return { isValid: false, message: "VehicleID is required" };
  if (!DepartureTime) return { isValid: false, message: "DepartureTime is required" };
  if (!ArrivalTime) return { isValid: false, message: "ArrivalTime is required" };
  if (DayActive == null) return { isValid: false, message: "DayActive is required" };
  if (![1,2,3,4,5,6,7].includes(DayActive)) return { isValid: false, message: "DayActive must be a number from 1 (Mon) to 7 (Sun)" };
  // Validate references
  const referenceValidation = await validateMultipleReferences({
    VehicleID: { id: VehicleID, Model: Vehicle },
    ...Object.fromEntries(RouteID.map(id => [id, { id, Model: Route }]))
  });
  if (referenceValidation) {
    return { isValid: false, message: referenceValidation.message };
  }
  return { isValid: true };
};

export const createBusSchedule = controllerWrapper(async (req, res) => {
  return await createRecord(BusSchedule, req.body, "busSchedule", validateBusScheduleData);
});

export const getAllBusSchedules = controllerWrapper(async (req, res) => {
  return await getAllRecords(BusSchedule, "busSchedule", ["RouteID", "VehicleID"]);
});

export const getBusScheduleById = controllerWrapper(async (req, res) => {
  const { id } = req.params;
  return await getRecordById(BusSchedule, id, "busSchedule", ["RouteID", "VehicleID"]);
});

export const updateBusSchedule = controllerWrapper(async (req, res) => {
  const { id } = req.params;
  return await updateRecord(BusSchedule, id, req.body, "busSchedule", validateBusScheduleData);
});

export const deleteBusSchedule = controllerWrapper(async (req, res) => {
  const { id } = req.params;
  return await deleteRecord(BusSchedule, id, "busSchedule");
});
