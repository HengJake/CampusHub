import {
  createRecord,
  getAllRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
  validateReferenceExists,
  controllerWrapper
} from "../../utils/reusable.js";
import ParkingLot from "../../models/Facility/parkingLot.model.js";
import School from "../../models/Billing/school.model.js";

const validateParkingLotData = async (data) => {
  const { schoolId, zone, slotNumber, active } = data;
  if (!schoolId) return { isValid: false, message: "schoolId is required" };
  if (!zone) return { isValid: false, message: "zone is required" };
  if (slotNumber == null) return { isValid: false, message: "slotNumber is required" };
  if (typeof slotNumber !== 'number' || slotNumber < 1) return { isValid: false, message: "slotNumber must be a positive number" };

  // Check if reference exists
  const referenceValidation = await validateReferenceExists(schoolId, School, "schoolId");
  if (referenceValidation) {
    return { isValid: false, message: referenceValidation.message };
  }

  // Check for duplicate slot number in the same school and zone
  try {
    const existingParkingLot = await ParkingLot.findOne({
      schoolId,
      zone,
      slotNumber
    });

    if (existingParkingLot) {
      return {
        isValid: false,
        message: `Parking lot with slot number ${slotNumber} already exists in zone ${zone} for this school`
      };
    }
  } catch (error) {
    console.error("Error checking for duplicate parking lot:", error);
    return { isValid: false, message: "Error validating parking lot uniqueness" };
  }

  return { isValid: true };
};

export const createParkingLot = controllerWrapper(async (req, res) => {
  return await createRecord(ParkingLot, req.body, "parkingLot", validateParkingLotData);
});

export const getAllParkingLots = controllerWrapper(async (req, res) => {
  return await getAllRecords(ParkingLot, "parkingLot", ["schoolId"]);
});

export const getParkingLotById = controllerWrapper(async (req, res) => {
  const { id } = req.params;
  return await getRecordById(ParkingLot, id, "parkingLot", ["schoolId"]);
});

// Get ParkingLots by School ID
export const getParkingLotsBySchoolId = controllerWrapper(async (req, res) => {
  const { schoolId } = req.params;
  return await getAllRecords(
    ParkingLot,
    "parkingLots",
    ["schoolId"],
    { schoolId }
  );
});

export const updateParkingLot = controllerWrapper(async (req, res) => {
  const { id } = req.params;
  return await updateRecord(ParkingLot, id, req.body, "parkingLot", validateParkingLotData);
});

export const deleteParkingLot = controllerWrapper(async (req, res) => {
  const { id } = req.params;
  return await deleteRecord(ParkingLot, id, "parkingLot");
});

export const deleteAllParkingLots = controllerWrapper(async (req, res) => {
  const result = await ParkingLot.deleteMany({});
  return {
    success: true,
    data: { deletedCount: result.deletedCount },
    message: `${result.deletedCount} parking lots deleted successfully`,
    statusCode: 200
  };
});

export const bulkCreateParkingLots = controllerWrapper(async (req, res) => {
  const { parkingLots } = req.body;

  if (!Array.isArray(parkingLots) || parkingLots.length === 0) {
    return {
      success: false,
      message: "parkingLots array is required and must not be empty",
      statusCode: 400
    };
  }

  const results = [];
  const errors = [];
  const createdParkingLots = [];

  // First, validate all parking lots
  for (const parkingLotData of parkingLots) {
    const validation = await validateParkingLotData(parkingLotData);
    if (!validation.isValid) {
      errors.push({
        data: parkingLotData,
        error: validation.message
      });
    } else {
      results.push(parkingLotData);
    }
  }

  // If there are validation errors, return them
  if (errors.length > 0) {
    return {
      success: false,
      message: `Validation failed for ${errors.length} parking lots`,
      errors: errors,
      statusCode: 400
    };
  }

  // Create all valid parking lots
  try {
    for (const parkingLotData of results) {
      try {
        const newParkingLot = new ParkingLot(parkingLotData);
        await newParkingLot.save();
        createdParkingLots.push(newParkingLot);
      } catch (error) {
        if (error.code === 11000) {
          // Duplicate key error (shouldn't happen with our validation, but just in case)
          errors.push({
            data: parkingLotData,
            error: `Parking lot with slot number ${parkingLotData.slotNumber} already exists in zone ${parkingLotData.zone} for this school`
          });
        } else {
          errors.push({
            data: parkingLotData,
            error: error.message
          });
        }
      }
    }

    return {
      success: true,
      data: createdParkingLots,
      message: `Successfully created ${createdParkingLots.length} parking lots`,
      errors: errors.length > 0 ? errors : null,
      statusCode: 201
    };
  } catch (error) {
    return {
      success: false,
      message: `Error creating parking lots: ${error.message}`,
      statusCode: 500
    };
  }
});

export const getExistingSlotNumbers = controllerWrapper(async (req, res) => {
  const { schoolId, zone } = req.query;

  if (!schoolId || !zone) {
    return {
      success: false,
      message: "schoolId and zone are required",
      statusCode: 400
    };
  }

  try {
    const existingSlots = await ParkingLot.find({ schoolId, zone })
      .select('slotNumber')
      .lean();

    const slotNumbers = existingSlots.map(slot => slot.slotNumber);

    return {
      success: true,
      data: { slotNumbers, count: slotNumbers.length },
      message: `Found ${slotNumbers.length} existing slots in zone ${zone}`,
      statusCode: 200
    };
  } catch (error) {
    return {
      success: false,
      message: `Error retrieving existing slot numbers: ${error.message}`,
      statusCode: 500
    };
  }
});

export const checkForDuplicates = controllerWrapper(async (req, res) => {
  const { schoolId } = req.query;

  if (!schoolId) {
    return {
      success: false,
      message: "schoolId is required",
      statusCode: 400
    };
  }

  try {
    // Find all parking lots for the school
    const parkingLots = await ParkingLot.find({ schoolId }).lean();

    // Group by zone and check for duplicates
    const zoneGroups = {};
    const duplicates = [];

    parkingLots.forEach(lot => {
      const key = `${lot.zone}`;
      if (!zoneGroups[key]) {
        zoneGroups[key] = [];
      }
      zoneGroups[key].push(lot.slotNumber);
    });

    // Check for duplicates in each zone
    Object.entries(zoneGroups).forEach(([zone, slotNumbers]) => {
      const seen = new Set();
      const zoneDuplicates = [];

      slotNumbers.forEach(slotNumber => {
        if (seen.has(slotNumber)) {
          zoneDuplicates.push(slotNumber);
        } else {
          seen.add(slotNumber);
        }
      });

      if (zoneDuplicates.length > 0) {
        duplicates.push({
          zone,
          duplicateSlots: [...new Set(zoneDuplicates)],
          totalSlots: slotNumbers.length
        });
      }
    });

    return {
      success: true,
      data: {
        totalParkingLots: parkingLots.length,
        zones: Object.keys(zoneGroups),
        duplicates: duplicates,
        hasDuplicates: duplicates.length > 0
      },
      message: duplicates.length > 0
        ? `Found ${duplicates.length} zones with duplicate slot numbers`
        : `No duplicates found in ${Object.keys(zoneGroups).length} zones`,
      statusCode: 200
    };
  } catch (error) {
    return {
      success: false,
      message: `Error checking for duplicates: ${error.message}`,
      statusCode: 500
    };
  }
});

export const cleanupDuplicates = controllerWrapper(async (req, res) => {
  const { schoolId } = req.query;

  if (!schoolId) {
    return {
      success: false,
      message: "schoolId is required",
      statusCode: 400
    };
  }

  try {
    // Find all parking lots for the school
    const parkingLots = await ParkingLot.find({ schoolId }).sort({ createdAt: 1 });

    // Group by zone and slot number to find duplicates
    const duplicates = [];
    const seen = new Map(); // zone + slotNumber -> first occurrence

    parkingLots.forEach(lot => {
      const key = `${lot.zone}-${lot.slotNumber}`;
      if (seen.has(key)) {
        // This is a duplicate, mark for deletion
        duplicates.push(lot._id);
      } else {
        seen.set(key, lot._id);
      }
    });

    if (duplicates.length === 0) {
      return {
        success: true,
        data: { deletedCount: 0 },
        message: "No duplicates found to clean up",
        statusCode: 200
      };
    }

    // Delete duplicate parking lots
    const deleteResult = await ParkingLot.deleteMany({ _id: { $in: duplicates } });

    return {
      success: true,
      data: {
        deletedCount: deleteResult.deletedCount,
        totalParkingLots: parkingLots.length - deleteResult.deletedCount,
        duplicatesRemoved: duplicates.length
      },
      message: `Successfully removed ${deleteResult.deletedCount} duplicate parking lots`,
      statusCode: 200
    };
  } catch (error) {
    return {
      success: false,
      message: `Error cleaning up duplicates: ${error.message}`,
      statusCode: 500
    };
  }
});

