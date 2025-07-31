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
    const validStatuses = ['reported', 'in_search', 'found', 'claimed', 'archived'];
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
  return await getAllRecords(LostItem, "lostItems", ["personId", "schoolId", "matchedItem"]);
});

export const getLostItemById = controllerWrapper(async (req, res) => {
  const { id } = req.params;
  return await getRecordById(LostItem, id, "lostItem", ["personId", "schoolId", "matchedItem"]);
});

// Get LostItems by owner (personId)
export const getLostItemsByOwner = controllerWrapper(async (req, res) => {
  const { owner } = req.params;
  return await getAllRecords(
    LostItem,
    "lostItems",
    ["personId", "schoolId", "matchedItem"],
    { personId: owner }
  );
});

// Get LostItems by matchedItem
export const getLostItemsByMatchedItem = controllerWrapper(async (req, res) => {
  const { matchedItem } = req.params;
  return await getAllRecords(
    LostItem,
    "lostItems",
    ["personId", "schoolId", "matchedItem"],
    { matchedItem: matchedItem }
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
