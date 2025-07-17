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
  const { SubmittedBy, Name, Description, FoundLocation, ClaimedBy, Status } = data;
  if (!SubmittedBy) return { isValid: false, message: "SubmittedBy is required" };
  if (!Name) return { isValid: false, message: "Name is required" };
  if (!Description) return { isValid: false, message: "Description is required" };
  if (!FoundLocation) return { isValid: false, message: "FoundLocation is required" };
  if (!['library', 'cafeteria', 'classroom', 'court', 'parking lot', 'other'].includes(FoundLocation)) return { isValid: false, message: "Invalid FoundLocation value" };
  if (Status && !['available', 'claimed', 'unclaimed'].includes(Status)) return { isValid: false, message: "Invalid Status value" };
  const referenceValidation = await validateMultipleReferences({
    SubmittedBy: { id: SubmittedBy, Model: User },
    ...(ClaimedBy && { ClaimedBy: { id: ClaimedBy, Model: User } })
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
  return await getAllRecords(FoundItem, "foundItem", ["SubmittedBy", "ClaimedBy"]);
});

export const getFoundItemById = controllerWrapper(async (req, res) => {
  const { id } = req.params;
  return await getRecordById(FoundItem, id, "foundItem", ["SubmittedBy", "ClaimedBy"]);
});


// Get FoundItems by SubmittedBy
export const getFoundItemsBySubmittedBy = controllerWrapper(async (req, res) => {
  const { submittedBy } = req.params;
  return await getAllRecords(
      FoundItem,
      "foundItems",
      ["SubmittedBy", "ClaimedBy"],
      { SubmittedBy: submittedBy }
  );
});

// Get FoundItems by ClaimedBy
export const getFoundItemsByClaimedBy = controllerWrapper(async (req, res) => {
  const { claimedBy } = req.params;
  return await getAllRecords(
      FoundItem,
      "foundItems",
      ["SubmittedBy", "ClaimedBy"],
      { ClaimedBy: claimedBy }
  );
}); 

export const updateFoundItem = controllerWrapper(async (req, res) => {
  const { id } = req.params;
  return await updateRecord(FoundItem, id, req.body, "foundItem", validateFoundItemData);
});

export const deleteFoundItem = controllerWrapper(async (req, res) => {
  const { id } = req.params;
  return await deleteRecord(FoundItem, id, "foundItem");
});
