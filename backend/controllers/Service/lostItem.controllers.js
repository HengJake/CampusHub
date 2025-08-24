import {
  createRecord,
  getAllRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
  validateReferenceExists,
  validateMultipleReferences,
  controllerWrapper,
  deleteAllRecords
} from "../../utils/reusable.js";
import LostItem from "../../models/Service/lostItem.model.js";
import Student from "../../models/Academic/student.model.js";
import School from "../../models/Billing/school.model.js";

const validateLostItemData = async (data) => {
  const { personId, schoolId, itemDetails, status, matchedItem } = data;

  // Check required fields
  if (!personId) return { isValid: false, message: "personId is required" };
  if (!schoolId) return { isValid: false, message: "schoolId is required" };
  if (!itemDetails) return { isValid: false, message: "itemDetails is required" };

  // Validate itemDetails nested object
  if (itemDetails) {
    const { name, description, location, lostDate } = itemDetails;
    if (!name) return { isValid: false, message: "itemDetails.name is required" };
    if (!description) return { isValid: false, message: "itemDetails.description is required" };
    if (!location) return { isValid: false, message: "itemDetails.location is required" };

    // Validate location enum
    const validLocations = ['library', 'cafeteria', 'classroom', 'court', 'parking lot', 'lobby', 'office', 'gym', 'outdoor_area', 'other'];
    if (!validLocations.includes(location)) {
      return { isValid: false, message: `itemDetails.location must be one of: ${validLocations.join(', ')}` };
    }

    // Validate lostDate if provided
    if (lostDate) {
      const dateObj = new Date(lostDate);
      if (isNaN(dateObj.getTime())) {
        return { isValid: false, message: "itemDetails.lostDate must be a valid date" };
      }
    }
  }

  // Validate status enum if provided
  if (status) {
    const validStatuses = ['reported', 'found', 'claimed'];
    if (!validStatuses.includes(status)) {
      return { isValid: false, message: `status must be one of: ${validStatuses.join(', ')}` };
    }
  }

  // Validate references exist
  const referenceValidation = await validateMultipleReferences({
    personId: { id: personId, Model: Student },
    schoolId: { id: schoolId, Model: School }
  });

  if (referenceValidation) {
    return { isValid: false, message: referenceValidation.message };
  }

  return { isValid: true };
};

export const createLostItem = controllerWrapper(async (req, res) => {
  return await createRecord(LostItem, req.body, "lostItem", validateLostItemData);
});

export const getAllLostItems = controllerWrapper(async (req, res) => {
  return await getAllRecords(LostItem, "lostItems", [{ path: "personId", populate: "userId" }, "schoolId", "matchedItem"]);
});

export const getLostItemById = controllerWrapper(async (req, res) => {
  const { id } = req.params;
  return await getRecordById(LostItem, id, "lostItem", [{ path: "personId", populate: "userId" }, "schoolId", "matchedItem"]);
});

// Get LostItems by owner (personId)
export const getLostItemsByOwner = controllerWrapper(async (req, res) => {
  const { owner } = req.params;
  return await getAllRecords(
    LostItem,
    "lostItems",
    [{ path: "personId", populate: "userId" }, "schoolId", "matchedItem"],
    { personId: owner }
  );
});

// Get LostItems by student ID
export const getLostItemsByStudentId = controllerWrapper(async (req, res) => {
  const { studentId } = req.params;
  return await getAllRecords(
    LostItem,
    "lostItems",
    [{ path: "personId", populate: "userId" }, "schoolId", "matchedItem"],
    { personId: studentId }
  );
});

// Get LostItems by matchedItem
export const getLostItemsByMatchedItem = controllerWrapper(async (req, res) => {
  const { matchedItem } = req.params;
  return await getAllRecords(
    LostItem,
    "lostItems",
    [{ path: "personId", populate: "userId" }, "schoolId", "matchedItem"],
    { matchedItem: matchedItem }
  );
});

// Get LostItems by School ID
export const getLostItemsBySchoolId = controllerWrapper(async (req, res) => {
  const { schoolId } = req.params;
  return await getAllRecords(
    LostItem,
    "lostItems",
    [{ path: "personId", populate: "userId" }, "schoolId", "matchedItem"],
    { schoolId: schoolId }
  );
});

export const updateLostItem = controllerWrapper(async (req, res) => {
  const { id } = req.params;
  return await updateRecord(LostItem, id, req.body, "lostItem", validateLostItemData);
});

export const deleteLostItem = controllerWrapper(async (req, res) => {
  const { id } = req.params;
  return await deleteRecord(LostItem, id, "lostItem");
});

export const deleteAllLostItems = controllerWrapper(async (req, res) => {
  return await deleteAllRecords(LostItem, "lostItems");
});

// Match a reported item with a found item
export const matchLostItems = controllerWrapper(async (req, res) => {
  const { reportedItemId, foundItemId } = req.body;

  if (!reportedItemId || !foundItemId) {
    return {
      success: false,
      message: "Both reportedItemId and foundItemId are required",
      statusCode: 400
    };
  }

  try {
    // Get both items
    const reportedItem = await LostItem.findById(reportedItemId);
    console.log("🚀 ~ reportedItem:", reportedItem)
    const foundItem = await LostItem.findById(foundItemId);
    console.log("🚀 ~ foundItem:", foundItem)

    if (!reportedItem || !foundItem) {
      return {
        success: false,
        message: "One or both items not found",
        statusCode: 404
      };
    }

    // Validate that items can be matched
    if (reportedItem.status !== 'reported') {
      return {
        success: false,
        message: "First item must have 'reported' status",
        statusCode: 400
      };
    }

    if (foundItem.status !== 'found') {
      return {
        success: false,
        message: "Second item must have 'found' status",
        statusCode: 400
      };
    }

    if (reportedItem.schoolId.toString() !== foundItem.schoolId.toString()) {
      return {
        success: false,
        message: "Items must belong to the same school",
        statusCode: 400
      };
    }

    // Update both items to link them and change status to claimed
    const updateData = {
      status: 'claimed',
      matchedItem: foundItemId,
      resolution: {
        status: 'matched',
        date: new Date(),
        notes: `Matched with item: ${foundItem.itemDetails.name}`
      }
    };

    // Update reported item
    await LostItem.findByIdAndUpdate(reportedItemId, updateData);

    // Update found item
    await LostItem.findByIdAndUpdate(foundItemId, {
      status: 'claimed',
      matchedItem: reportedItemId,
      resolution: {
        status: 'matched',
        date: new Date(),
        notes: `Matched with reported item: ${reportedItem.itemDetails.name}`
      }
    });

    // Get updated items with populated references
    const updatedReportedItem = await LostItem.findById(reportedItemId)
      .populate('personId')
      .populate('schoolId')
      .populate('matchedItem');

    const updatedFoundItem = await LostItem.findById(foundItemId)
      .populate('personId')
      .populate('schoolId')
      .populate('matchedItem');

    return {
      success: true,
      message: "Items successfully matched and status updated to claimed",
      data: {
        reportedItem: updatedReportedItem,
        foundItem: updatedFoundItem
      },
      statusCode: 200
    };
  } catch (error) {
    console.error('Error matching lost items:', error);
    return {
      success: false,
      message: "Failed to match items",
      error: error.message,
      statusCode: 500
    };
  }
});
