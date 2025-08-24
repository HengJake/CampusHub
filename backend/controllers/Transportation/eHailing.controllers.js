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
  // Reference validation - vehicleId is now optional since it's auto-assigned
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
  try {
    // Get schoolId from the request body or user context
    let schoolId = req.body.schoolId;
    if (!schoolId) {
      // If no schoolId in body, try to get it from user context
      // This would need to be implemented based on your auth middleware
      throw new Error("School ID is required");
    }

    // Find an available car-type vehicle for this school
    const availableVehicle = await Vehicle.findOne({
      schoolId: schoolId,
      type: "car",
      status: "available"
    });

    if (!availableVehicle) {
      return {
        success: false,
        message: "No available car-type vehicles found for this school",
        statusCode: 400
      };
    }

    // Update the vehicle status to in_service
    await Vehicle.findByIdAndUpdate(availableVehicle._id, {
      status: "in_service"
    });

    // Add the vehicleId to the request body
    req.body.vehicleId = availableVehicle._id;

    // Create the eHailing record
    const result = await createRecord(EHailing, req.body, "eHailing", validateEHailingData);

    if (result.success) {
      return {
        ...result,
        message: `eHailing created successfully. Assigned vehicle: ${availableVehicle.plateNumber}`
      };
    }

    return result;
  } catch (error) {
    return {
      success: false,
      message: error.message,
      statusCode: 500
    };
  }
});

export const getAllEHailing = controllerWrapper(async (req, res) => {
  return await getAllRecords(EHailing, "eHailing", [{ path: "studentId", populate: "userId" }, {
    path: "routeId",
    populate: "stopIds"
  }, "vehicleId"]);
});

export const getEHailingById = controllerWrapper(async (req, res) => {
  const { id } = req.params;
  return await getRecordById(EHailing, id, "eHailing", [{ path: "studentId", populate: "userId" }, {
    path: "routeId",
    populate: "stopIds"
  }, "vehicleId"]);
});

// Get EHailings by Student ID
export const getEHailingsByStudentId = controllerWrapper(async (req, res) => {
  const { studentId } = req.params;
  return await getAllRecords(
    EHailing,
    "eHailings",
    [{
      path: "studentId",
      populate: "userId"
    }, {
      path: "routeId",
      populate: "stopIds"
    }, "vehicleId"],
    { studentId: studentId }
  );
});

// Get EHailings by Route ID
export const getEHailingsByRouteId = controllerWrapper(async (req, res) => {
  const { routeId } = req.params;
  return await getAllRecords(
    EHailing,
    "eHailings",
    [{ path: "studentId", populate: "userId" }, {
      path: "routeId",
      populate: "stopIds"
    }, "vehicleId"],
    { routeId: routeId }
  );
});

// Get EHailings by Vehicle ID
export const getEHailingsByVehicleId = controllerWrapper(async (req, res) => {
  const { vehicleId } = req.params;
  return await getAllRecords(
    EHailing,
    "eHailings",
    [{ path: "studentId", populate: "userId" }, {
      path: "routeId",
      populate: "stopIds"
    }, "vehicleId"],
    { vehicleId: vehicleId }
  );
});

// Get EHailings by School ID
export const getEHailingsBySchoolId = controllerWrapper(async (req, res) => {
  const { schoolId } = req.params;
  return await getAllRecords(
    EHailing,
    "eHailings",
    [{ path: "studentId", populate: "userId" }, {
      path: "routeId",
      populate: "stopIds"
    }, "vehicleId"],
    { schoolId: schoolId }
  );
});

export const updateEHailing = controllerWrapper(async (req, res) => {
  const { id } = req.params;

  try {
    // Get the current eHailing record to check if status is being updated
    const currentEHailing = await EHailing.findById(id);
    if (!currentEHailing) {
      return {
        success: false,
        message: "eHailing record not found",
        statusCode: 404
      };
    }

    // If status is being updated to completed or cancelled, free up the vehicle
    if (req.body.status &&
      ["completed", "cancelled"].includes(req.body.status) &&
      currentEHailing.vehicleId) {

      // Update vehicle status back to available
      await Vehicle.findByIdAndUpdate(currentEHailing.vehicleId, {
        status: "available"
      });
    }

    // Update the eHailing record
    return await updateRecord(EHailing, id, req.body, "eHailing", validateEHailingData);
  } catch (error) {
    return {
      success: false,
      message: error.message,
      statusCode: 500
    };
  }
});

export const deleteEHailing = controllerWrapper(async (req, res) => {
  const { id } = req.params;
  return await deleteRecord(EHailing, id, "eHailing");
});

// Get available car-type vehicles for a school
export const getAvailableVehicles = controllerWrapper(async (req, res) => {
  const { schoolId } = req.params;

  try {
    const availableVehicles = await Vehicle.find({
      schoolId: schoolId,
      type: "car",
      status: "available"
    }).select('plateNumber type capacity status');

    return {
      success: true,
      data: availableVehicles,
      message: `Found ${availableVehicles.length} available car-type vehicles`,
      statusCode: 200
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      statusCode: 500
    };
  }
});

export const deleteAllEHailings = controllerWrapper(async (req, res) => {
  const result = await EHailing.deleteMany({});
  return {
    success: true,
    data: { deletedCount: result.deletedCount },
    message: `${result.deletedCount} e-hailing records deleted successfully`,
    statusCode: 200
  };
});


