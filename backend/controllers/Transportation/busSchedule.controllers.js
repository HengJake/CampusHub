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
  const { routeId, vehicleId, departureTime, arrivalTime, dayActive } = data;
  if (!routeId || !Array.isArray(routeId) || routeId.length === 0) return { isValid: false, message: "routeId array is required" };
  if (!vehicleId) return { isValid: false, message: "vehicleId is required" };
  if (!departureTime) return { isValid: false, message: "departureTime is required" };
  if (!arrivalTime) return { isValid: false, message: "arrivalTime is required" };
  if (dayActive == null) return { isValid: false, message: "dayActive is required" };
  if (![1, 2, 3, 4, 5, 6, 7].includes(dayActive)) return { isValid: false, message: "dayActive must be a number from 1 (Mon) to 7 (Sun)" };
  // Validate references
  const referenceValidation = await validateMultipleReferences({
    vehicleId: { id: vehicleId, Model: Vehicle },
    ...Object.fromEntries(routeId.map(id => [id, { id, Model: Route }]))
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
  return await getAllRecords(BusSchedule, "busSchedule", ["routeID", "vehicleID"]);
});

export const getBusScheduleById = controllerWrapper(async (req, res) => {
  const { id } = req.params;
  return await getRecordById(BusSchedule, id, "busSchedule", ["routeID", "vehicleID"]);
});

// Get BusSchedules by Route ID
export const getBusSchedulesByRouteId = controllerWrapper(async (req, res) => {
  const { routeID } = req.params;
  return await getAllRecords(
    BusSchedule,
    "busSchedules",
    ["routeID", "vehicleID"],
    { routeID: routeID }
  );
});

// Get BusSchedules by Vehicle ID
export const getBusSchedulesByVehicleId = controllerWrapper(async (req, res) => {
  const { vehicleID } = req.params;
  return await getAllRecords(
    BusSchedule,
    "busSchedules",
    ["routeID", "vehicleID"],
    { vehicleID: vehicleID }
  );
});


export const updateBusSchedule = controllerWrapper(async (req, res) => {
  const { id } = req.params;
  return await updateRecord(BusSchedule, id, req.body, "busSchedule", validateBusScheduleData);
});

export const deleteBusSchedule = controllerWrapper(async (req, res) => {
  const { id } = req.params;
  return await deleteRecord(BusSchedule, id, "busSchedule");
});

export const deleteAllBusSchedules = async (req, res) => {
  try {
    await BusSchedule.deleteMany({});
    res.status(200).json({ message: 'All bus schedules deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting all bus schedules', error: error.message });
  }
};
