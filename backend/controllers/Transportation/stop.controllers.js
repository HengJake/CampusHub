import {
  createRecord,
  getAllRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
  controllerWrapper
} from "../../utils/reusable.js";
import Stop from "../../models/Transportation/stop.model.js";

const validateStopData = async (data) => {
  const { name, type } = data;
  if (!name) return { isValid: false, message: "name is required" };
  if (!type) return { isValid: false, message: "type is required" };
  if (!["dorm", "campus"].includes(type)) return { isValid: false, message: "type must be either 'dorm' or 'campus'" };
  return { isValid: true };
};

export const createStop = controllerWrapper(async (req, res) => {
  return await createRecord(Stop, req.body, "stop", validateStopData);
});

export const getAllStops = controllerWrapper(async (req, res) => {
  return await getAllRecords(Stop, "stop");
});

export const getStopById = controllerWrapper(async (req, res) => {
  const { id } = req.params;
  return await getRecordById(Stop, id, "stop");
});

export const getStopsByType = controllerWrapper(async (req, res) => {
  const { type } = req.params;
  if (!["dorm", "campus"].includes(type)) {
    return {
      success: false,
      message: "type must be either 'dorm' or 'campus'",
      statusCode: 400
    };
  }
  return await getAllRecords(Stop, "stop", [], { type });
});

// Get Stops by School ID
export const getStopsBySchoolId = controllerWrapper(async (req, res) => {
  const { schoolId } = req.params;
  return await getAllRecords(Stop, "stop", [], { schoolId: schoolId });
});

export const updateStop = controllerWrapper(async (req, res) => {
  const { id } = req.params;
  return await updateRecord(Stop, id, req.body, "stop", validateStopData);
});

export const deleteStop = controllerWrapper(async (req, res) => {
  const { id } = req.params;
  return await deleteRecord(Stop, id, "stop");
});

export const deleteAllStops = controllerWrapper(async (req, res) => {
  const result = await Stop.deleteMany({});
  return {
    success: true,
    data: { deletedCount: result.deletedCount },
    message: `${result.deletedCount} stops deleted successfully`,
    statusCode: 200
  };
});
