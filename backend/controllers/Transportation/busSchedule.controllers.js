import {
  createRecord,
  getAllRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
  validateMultipleReferences,
  controllerWrapper
} from "../../utils/reusable.js";
import BusSchedule from "../../models/Transportation/busSchedule.model.js";
import Route from "../../models/Transportation/route.model.js";
import Vehicle from "../../models/Transportation/vehicle.model.js";

const validateBusScheduleData = async (data) => {
  const { routeTiming, vehicleId, dayOfWeek, startDate, endDate } = data;

  if (!routeTiming || !Array.isArray(routeTiming) || routeTiming.length === 0) {
    return { isValid: false, message: "routeTiming array is required" };
  }

  // Validate each route timing entry
  for (const timing of routeTiming) {
    if (!timing.routeId) return { isValid: false, message: "routeId is required for each route timing" };
    if (!timing.startTime) return { isValid: false, message: "startTime is required for each route timing" };
    if (!timing.endTime) return { isValid: false, message: "endTime is required for each route timing" };

    // Validate time format (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(timing.startTime)) return { isValid: false, message: "startTime must be in HH:MM format" };
    if (!timeRegex.test(timing.endTime)) return { isValid: false, message: "endTime must be in HH:MM format" };
  }

  if (!vehicleId) return { isValid: false, message: "vehicleId is required" };
  if (!dayOfWeek || ![1, 2, 3, 4, 5, 6, 7].includes(dayOfWeek)) return { isValid: false, message: "dayOfWeek must be a number from 1 (Mon) to 7 (Sun)" };
  if (!startDate) return { isValid: false, message: "startDate is required" };
  if (!endDate) return { isValid: false, message: "endDate is required" };

  // Validate date range
  if (new Date(startDate) >= new Date(endDate)) return { isValid: false, message: "startDate must be before endDate" };

  // Validate references
  const routeIds = routeTiming.map(timing => timing.routeId);
  const referenceValidation = await validateMultipleReferences({
    vehicleId: { id: vehicleId, Model: Vehicle },
    ...Object.fromEntries(routeIds.map(id => [id, { id, Model: Route }]))
  });
  if (referenceValidation) {
    return { isValid: false, message: referenceValidation.message };
  }
  return { isValid: true };
};

// Helper function to calculate end time based on start time and route duration
const calculateEndTime = (startTime, durationMinutes) => {
  if (!startTime || !durationMinutes) return null;

  // Parse start time and add duration
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const startDate = new Date(`2000-01-01T${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}:00`);
  const endDate = new Date(startDate.getTime() + durationMinutes * 60000); // Convert minutes to milliseconds

  // Format end time as HH:MM
  const endHour = endDate.getHours();
  const endMinute = endDate.getMinutes();
  return `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
};

export const createBusSchedule = controllerWrapper(async (req, res) => {
  const scheduleData = req.body;

  // Calculate end times for each route based on their duration
  if (scheduleData.routeTiming && scheduleData.routeTiming.length > 0) {
    try {
      const routeIds = scheduleData.routeTiming.map(timing => timing.routeId);
      const routes = await Route.find({ _id: { $in: routeIds } });

      if (routes.length > 0) {
        // Create a map of route durations for quick lookup
        const routeDurationMap = {};
        routes.forEach(route => {
          routeDurationMap[route._id.toString()] = route.estimateTimeMinute;
        });

        // Calculate end time for each route timing
        scheduleData.routeTiming = scheduleData.routeTiming.map(timing => {
          const duration = routeDurationMap[timing.routeId.toString()];
          if (duration && timing.startTime) {
            const endTime = calculateEndTime(timing.startTime, duration);
            return {
              ...timing,
              endTime: endTime || timing.endTime
            };
          }
          return timing;
        });
      }
    } catch (error) {
      console.error('Error calculating end times:', error);
      return {
        success: false,
        message: "Error calculating end times from route durations",
        statusCode: 500
      };
    }
  }

  return await createRecord(BusSchedule, scheduleData, "busSchedule", validateBusScheduleData);
});

export const getAllBusSchedules = controllerWrapper(async (req, res) => {
  return await getAllRecords(BusSchedule, "busSchedule", [
    "routeTiming.routeId",
    { path: "routeTiming.routeId", populate: { path: "stopIds" } },
    "vehicleId"
  ]);
});

export const getBusScheduleById = controllerWrapper(async (req, res) => {
  const { id } = req.params;
  return await getRecordById(BusSchedule, id, "busSchedule", [
    "routeTiming.routeId",
    { path: "routeTiming.routeId", populate: { path: "stopIds" } },
    "vehicleId"
  ]);
});

// Get BusSchedules by Route ID
export const getBusSchedulesByRouteId = controllerWrapper(async (req, res) => {
  const { routeID } = req.params;
  return await getAllRecords(
    BusSchedule,
    "busSchedules",
    [
      "routeTiming.routeId",
      { path: "routeTiming.routeId", populate: { path: "stopIds" } },
      "vehicleId"
    ],
    { "routeTiming.routeId": routeID }
  );
});

// Get BusSchedules by Vehicle ID
export const getBusSchedulesByVehicleId = controllerWrapper(async (req, res) => {
  const { vehicleID } = req.params;
  return await getAllRecords(
    BusSchedule,
    "busSchedules",
    [
      "routeTiming.routeId",
      { path: "routeTiming.routeId", populate: { path: "stopIds" } },
      "vehicleId"
    ],
    { vehicleId: vehicleID }
  );
});

// Get BusSchedules by School ID
export const getBusSchedulesBySchoolId = controllerWrapper(async (req, res) => {
  const { schoolId } = req.params;
  return await getAllRecords(
    BusSchedule,
    "busSchedules",
    [
      "routeTiming.routeId",
      { path: "routeTiming.routeId", populate: { path: "stopIds" } },
      "vehicleId"
    ],
    { schoolId: schoolId }
  );
});

// Get BusSchedules by Student ID
export const getBusSchedulesByStudentId = controllerWrapper(async (req, res) => {
  const { studentId } = req.params;
  return await getAllRecords(
    BusSchedule,
    "busSchedules",
    [
      "routeTiming.routeId",
      { path: "routeTiming.routeId", populate: { path: "stopIds" } },
      "vehicleId"
    ],
    { studentId: studentId }
  );
});

// Get BusSchedules by Day of Week
export const getBusSchedulesByDayOfWeek = controllerWrapper(async (req, res) => {
  const { dayOfWeek } = req.params;
  const day = parseInt(dayOfWeek);
  if (day < 1 || day > 7) {
    return {
      success: false,
      message: "dayOfWeek must be a number from 1 to 7",
      statusCode: 400
    };
  }
  return await getAllRecords(
    BusSchedule,
    "busSchedules",
    [
      "routeTiming.routeId",
      { path: "routeTiming.routeId", populate: { path: "stopIds" } },
      "vehicleId"
    ],
    { dayOfWeek: day }
  );
});

export const updateBusSchedule = controllerWrapper(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  // Recalculate end times if routeTiming changed
  if (updateData.routeTiming) {
    try {
      const currentSchedule = await BusSchedule.findById(id);
      if (!currentSchedule) {
        return {
          success: false,
          message: "Bus schedule not found",
          statusCode: 404
        };
      }

      const routeIds = updateData.routeTiming.map(timing => timing.routeId);
      const routes = await Route.find({ _id: { $in: routeIds } });

      if (routes.length > 0) {
        // Create a map of route durations for quick lookup
        const routeDurationMap = {};
        routes.forEach(route => {
          routeDurationMap[route._id.toString()] = route.estimateTimeMinute;
        });

        // Calculate end time for each route timing
        updateData.routeTiming = updateData.routeTiming.map(timing => {
          const duration = routeDurationMap[timing.routeId.toString()];
          if (duration && timing.startTime) {
            const endTime = calculateEndTime(timing.startTime, duration);
            return {
              ...timing,
              endTime: endTime || timing.endTime
            };
          }
          return timing;
        });
      }
    } catch (error) {
      console.error('Error calculating end times during update:', error);
      return {
        success: false,
        message: "Error calculating end times from route durations",
        statusCode: 500
      };
    }
  }

  return await updateRecord(BusSchedule, id, updateData, "busSchedule", validateBusScheduleData);
});

export const deleteBusSchedule = controllerWrapper(async (req, res) => {
  const { id } = req.params;
  return await deleteRecord(BusSchedule, id, "busSchedule");
});

export const deleteAllBusSchedules = controllerWrapper(async (req, res) => {
  const result = await BusSchedule.deleteMany({});
  return {
    success: true,
    data: { deletedCount: result.deletedCount },
    message: `${result.deletedCount} bus schedules deleted successfully`,
    statusCode: 200
  };
});
