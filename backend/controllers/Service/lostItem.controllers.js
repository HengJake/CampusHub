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
import FoundItem from "../../models/Service/foundItem.model.js";

const validateLostItemData = async (data) => {
  const { Owner, Name, Description, Lostlocation, MatchedItem } = data;
  if (!Owner) return { isValid: false, message: "Owner is required" };
  if (!Name) return { isValid: false, message: "Name is required" };
  if (!Description) return { isValid: false, message: "Description is required" };
  if (!Lostlocation) return { isValid: false, message: "Lostlocation is required" };
  if (!['library', 'cafeteria', 'classroom', 'court', 'parking lot', 'other'].includes(Lostlocation)) return { isValid: false, message: "Invalid Lostlocation value" };
  const referenceValidation = await validateMultipleReferences({
    Owner: { id: Owner, Model: User },
    ...(MatchedItem && { MatchedItem: { id: MatchedItem, Model: FoundItem } })
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
  return await getAllRecords(LostItem, "lostItem", ["Owner", "MatchedItem"]);
});

export const getLostItemById = controllerWrapper(async (req, res) => {
  const { id } = req.params;
  return await getRecordById(LostItem, id, "lostItem", ["Owner", "MatchedItem"]);
});


// Get LostItems by Owner
export const getLostItemsByOwner = controllerWrapper(async (req, res) => {
  const { owner } = req.params;
  return await getAllRecords(
      LostItem,
      "lostItems",
      ["Owner", "MatchedItem"],
      { Owner: owner }
  );
});

// Get LostItems by MatchedItem
export const getLostItemsByMatchedItem = controllerWrapper(async (req, res) => {
  const { matchedItem } = req.params;
  return await getAllRecords(
      LostItem,
      "lostItems",
      ["Owner", "MatchedItem"],
      { MatchedItem: matchedItem }
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
