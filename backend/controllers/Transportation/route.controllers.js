import {
  createRecord,
  getAllRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
  validateMultipleReferences,
  controllerWrapper
} from "../../utils/reusable.js";
import Route from "../../models/Transportation/route.model.js";
import Stop from "../../models/Transportation/stop.model.js";

const validateRouteData = async (data) => {
  const { name, stopIds, estimateTimeMinute, fare } = data;
  if (!name) return { isValid: false, message: "name is required" };
  if (!stopIds || !Array.isArray(stopIds) || stopIds.length === 0) return { isValid: false, message: "stopIds array is required" };
  if (estimateTimeMinute == null) return { isValid: false, message: "estimateTimeMinute is required" };
  if (fare == null) return { isValid: false, message: "fare is required" };
  if (estimateTimeMinute < 0) return { isValid: false, message: "estimateTimeMinute must be >= 0" };
  if (fare < 0) return { isValid: false, message: "fare must be >= 0" };
  // Validate Stop references
  const referenceValidation = await validateMultipleReferences(
    Object.fromEntries(stopIds.map(id => [id, { id, Model: Stop }]))
  );
  if (referenceValidation) {
    return { isValid: false, message: referenceValidation.message };
  }
  return { isValid: true };
};

export const createRoute = controllerWrapper(async (req, res) => {
  return await createRecord(Route, req.body, "route", validateRouteData);
});

export const getAllRoutes = controllerWrapper(async (req, res) => {
  return await getAllRecords(Route, "route", ["stopIds"]);
});

export const getRouteById = controllerWrapper(async (req, res) => {
  const { id } = req.params;
  return await getRecordById(Route, id, "route", ["stopIds"]);
});

// Get Routes by Stop ID
export const getRoutesByStopId = controllerWrapper(async (req, res) => {
  const { stopId } = req.params;
  return await getAllRecords(
    Route,
    "routes",
    ["stopIds"],
    { stopIds: { $in: [stopId] } }
  );
});

// Get Routes by School ID
export const getRoutesBySchoolId = controllerWrapper(async (req, res) => {
  const { schoolId } = req.params;
  return await getAllRecords(
    Route,
    "routes",
    ["stopIds"],
    { schoolId: schoolId }
  );
});

export const updateRoute = controllerWrapper(async (req, res) => {
  const { id } = req.params;
  return await updateRecord(Route, id, req.body, "route", validateRouteData);
});

export const deleteRoute = controllerWrapper(async (req, res) => {
  const { id } = req.params;
  return await deleteRecord(Route, id, "route");
});

export const deleteAllRoutes = controllerWrapper(async (req, res) => {
  const result = await Route.deleteMany({});
  return {
    success: true,
    data: { deletedCount: result.deletedCount },
    message: `${result.deletedCount} routes deleted successfully`,
    statusCode: 200
  };
});

