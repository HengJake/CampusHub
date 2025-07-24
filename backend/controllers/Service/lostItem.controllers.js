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
import LostItem from "../../models/Service/lostItem.model.js";
import User from "../../models/Academic/user.model.js";
import Student from "../../models/Academic/student.model.js";

const validateLostItemData = async (data) => {
  const { ownerId, name, description, lostLocation, matchedItem } = data;
  if (!ownerId) return { isValid: false, message: "ownerId is required" };
  if (!name) return { isValid: false, message: "name is required" };
  if (!description) return { isValid: false, message: "description is required" };
  if (!lostLocation) return { isValid: false, message: "lostLocation is required" };
  if (!['library', 'cafeteria', 'classroom', 'court', 'parking lot', 'other'].includes(lostLocation)) return { isValid: false, message: "Invalid lostLocation value" };
  const referenceValidation = await validateMultipleReferences({
    ownerId: { id: ownerId, Model: Student },
    ...(matchedItem && { matchedItem: { id: matchedItem, Model: FoundItem } })
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
  return await getAllRecords(LostItem, "lostItem", ["ownerId", "matchedItem"]);
});

export const getLostItemById = controllerWrapper(async (req, res) => {
  const { id } = req.params;
  return await getRecordById(LostItem, id, "lostItem", ["ownerId", "matchedItem"]);
});

// Get LostItems by owner
export const getLostItemsByOwner = controllerWrapper(async (req, res) => {
  const { ownerId } = req.params;
  return await getAllRecords(
    LostItem,
    "lostItems",
    ["ownerId", "matchedItem"],
    { ownerId: ownerId }
  );
});

// Get LostItems by matchedItem
export const getLostItemsByMatchedItem = controllerWrapper(async (req, res) => {
  const { matchedItem } = req.params;
  return await getAllRecords(
    LostItem,
    "lostItems",
    ["ownerId", "matchedItem"],
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

export const deleteAllLostItems = async (req, res) => {
  try {
    await LostItem.deleteMany({});
    res.status(200).json({ message: 'All lost items deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting all lost items', error: error.message });
  }
};
