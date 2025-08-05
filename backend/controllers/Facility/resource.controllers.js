import {
  createRecord,
  getAllRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
  validateReferenceExists,
  validateMultipleReferences,
  controllerWrapper
} from "../../utils/reusable.js";

import Resource from "../../models/Facility/resource.model.js";
import School from "../../models/Billing/school.model.js";

// Helper function to convert time string to minutes for comparison
const timeToMinutes = (timeString) => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

// Helper function to check if two time ranges overlap
const doTimeRangesOverlap = (start1, end1, start2, end2) => {
  const start1Min = timeToMinutes(start1);
  const end1Min = timeToMinutes(end1);
  const start2Min = timeToMinutes(start2);
  const end2Min = timeToMinutes(end2);

  return start1Min < end2Min && start2Min < end1Min;
};

// Function to validate timeslot clashes within a resource
const validateTimeslotClash = (timeslots) => {
  if (!timeslots || !Array.isArray(timeslots)) {
    return { isValid: true }; // No timeslots to validate
  }

  try {
    // Group timeslots by day
    const timeslotsByDay = {};

    timeslots.forEach(daySlot => {
      const { dayOfWeek, slots } = daySlot;

      if (!timeslotsByDay[dayOfWeek]) {
        timeslotsByDay[dayOfWeek] = [];
      }

      // Validate time format and add to day group
      slots.forEach(slot => {
        const { start, end } = slot;

        // Validate time format
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(start) || !timeRegex.test(end)) {
          return {
            isValid: false,
            message: "Invalid time format. Use HH:MM format (e.g., 09:00, 14:30)"
          };
        }

        // Validate that start time is before end time
        if (timeToMinutes(start) >= timeToMinutes(end)) {
          return {
            isValid: false,
            message: "Start time must be before end time"
          };
        }

        timeslotsByDay[dayOfWeek].push({ start, end });
      });
    });

    // Check for overlaps within each day
    for (const [dayOfWeek, slots] of Object.entries(timeslotsByDay)) {
      for (let i = 0; i < slots.length; i++) {
        for (let j = i + 1; j < slots.length; j++) {
          const slot1 = slots[i];
          const slot2 = slots[j];

          if (doTimeRangesOverlap(
            slot1.start, slot1.end,
            slot2.start, slot2.end
          )) {
            return {
              isValid: false,
              message: `Timeslot clash detected on ${dayOfWeek}. The time range ${slot1.start}-${slot1.end} overlaps with ${slot2.start}-${slot2.end}`
            };
          }
        }
      }
    }

    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      message: `Error validating timeslot clash: ${error.message}`
    };
  }
};

// Custom validation function for resource data
const validateResourceData = async (data) => {
  const { schoolId, timeslots } = data;

  // Check required fields
  if (!schoolId) {
    return {
      isValid: false,
      message: "schoolId is required"
    };
  }

  // Validate references exist
  const referenceValidation = await validateMultipleReferences({
    schoolId: { id: schoolId, Model: School }
  });

  if (referenceValidation) {
    return {
      isValid: false,
      message: referenceValidation.message
    };
  }

  // Validate timeslots if provided
  if (timeslots) {
    const timeslotValidation = validateTimeslotClash(timeslots);
    if (!timeslotValidation.isValid) {
      return timeslotValidation;
    }
  }

  return { isValid: true };
};

// Controller to create a new resource
export const createResource = controllerWrapper(async (req, res) => {
  return await createRecord(
    Resource,
    req.body,
    "resource",
    validateResourceData
  );
});

// Controller to get all resources
export const getAllResource = controllerWrapper(async (req, res) => {
  return await getAllRecords(Resource);
});

// Controller to get a resource by ID
export const getResourceById = controllerWrapper(async (req, res) => {
  return await getRecordById(Resource, req.params.id);
});

// Get Resources by School ID
export const getResourcesBySchoolId = controllerWrapper(async (req, res) => {
  const { schoolId } = req.params;
  return await getAllRecords(
    Resource,
    "resources",
    [],
    { schoolId: schoolId }
  );
});

// Controller to update an existing resource
export const updateResource = controllerWrapper(async (req, res) => {
  return await updateRecord(
    Resource,
    req.params.id,
    req.body,
    "resource",
    validateResourceData
  );
});

// Controller to delete a resource by ID
export const deleteResource = controllerWrapper(async (req, res) => {
  return await deleteRecord(Resource, req.params.id);
});

export const deleteAllResources = async (req, res) => {
  try {
    await Resource.deleteMany({});
    res.status(200).json({ message: 'All resources deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting all resources', error: error.message });
  }
};

// Get available timeslots for a resource on a specific day
export const getAvailableTimeslots = controllerWrapper(async (req, res) => {
  const { resourceId, dayOfWeek } = req.params;

  try {
    // Validate resource exists
    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found"
      });
    }

    // Get existing timeslots for the resource on the specified day
    const existingTimeslots = resource.timeslots.find(ts => ts.dayOfWeek === dayOfWeek);
    const occupiedSlots = existingTimeslots ? existingTimeslots.slots : [];

    // Generate all possible time slots (24 hours in 30-minute intervals)
    const allTimeSlots = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const endTime = minute === 30 ?
          `${hour.toString().padStart(2, '0')}:00` :
          `${(hour + 1).toString().padStart(2, '0')}:00`;

        if (hour < 23 || minute === 0) {
          allTimeSlots.push({
            start: startTime,
            end: endTime
          });
        }
      }
    }

    // Find available slots (slots that don't overlap with occupied slots)
    const availableSlots = allTimeSlots.filter(slot => {
      return !occupiedSlots.some(occupied =>
        doTimeRangesOverlap(slot.start, slot.end, occupied.start, occupied.end)
      );
    });

    return res.status(200).json({
      success: true,
      data: {
        resourceId,
        dayOfWeek,
        availableSlots,
        occupiedSlots
      },
      message: "Available timeslots retrieved successfully"
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error retrieving available timeslots",
      error: error.message
    });
  }
});


