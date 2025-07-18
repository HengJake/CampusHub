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
import FoundItem from "../../models/Service/foundItem.model.js";
import User from "../../models/Academic/user.model.js";

const validateFoundItemData = async (data) => {
  const { submittedBy, name, description, foundLocation, claimedBy, status } = data;
  if (!submittedBy) return { isValid: false, message: "submittedBy is required" };
  if (!name) return { isValid: false, message: "name is required" };
  if (!description) return { isValid: false, message: "description is required" };
  if (!foundLocation) return { isValid: false, message: "foundLocation is required" };
  if (!['library', 'cafeteria', 'classroom', 'court', 'parking lot', 'other'].includes(foundLocation)) return { isValid: false, message: "Invalid foundLocation value" };
  if (status && !['available', 'claimed', 'unclaimed'].includes(status)) return { isValid: false, message: "Invalid status value" };
  const referenceValidation = await validateMultipleReferences({
    submittedBy: { id: submittedBy, Model: User },
    ...(claimedBy && { claimedBy: { id: claimedBy, Model: User } })
  });
  if (referenceValidation) {
    return { isValid: false, message: referenceValidation.message };
  }
  return { isValid: true };
};

export const createFoundItem = controllerWrapper(async (req, res) => {
  return await createRecord(FoundItem, req.body, "foundItem", validateFoundItemData);
});

export const getAllFoundItems = controllerWrapper(async (req, res) => {
  return await getAllRecords(FoundItem, "foundItem", ["submittedBy", "claimedBy"]);
});

export const getFoundItemById = controllerWrapper(async (req, res) => {
  const { id } = req.params;
  return await getRecordById(FoundItem, id, "foundItem", ["submittedBy", "claimedBy"]);
});

// Get FoundItems by submittedBy
export const getFoundItemsBySubmittedBy = controllerWrapper(async (req, res) => {
  const { submittedBy } = req.params;
  return await getAllRecords(
    FoundItem,
    "foundItems",
    ["submittedBy", "claimedBy"],
    { submittedBy: submittedBy }
  );
});

// Get FoundItems by claimedBy
export const getFoundItemsByClaimedBy = controllerWrapper(async (req, res) => {
  const { claimedBy } = req.params;
  return await getAllRecords(
    FoundItem,
    "foundItems",
    ["submittedBy", "claimedBy"],
    { claimedBy: claimedBy }
  );
});

export const updateFoundItem = controllerWrapper(async (req, res) => {
  const { id } = req.params;
  return await updateRecord(FoundItem, id, req.body, "foundItem", validateFoundItemData);
});

export const deleteAllFoundItems = async (req, res) => {
  try {
    await FoundItem.deleteMany({});
    res.status(200).json({ message: 'All found items deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting all found items', error: error.message });
  }
};

export const deleteFoundItem = controllerWrapper(async (req, res) => {
  const { id } = req.params;
  return await deleteRecord(FoundItem, id, "foundItem");
});
