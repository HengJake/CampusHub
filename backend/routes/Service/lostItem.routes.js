import express from "express";
import {
  createLostItem,
  getAllLostItems,
  getLostItemById,
  getLostItemsByOwner,
  getLostItemsByMatchedItem,
  getLostItemsBySchoolId,
  updateLostItem,
  deleteLostItem,
  deleteAllLostItems
} from "../../controllers/Service/lostItem.controllers.js";

const router = express.Router();

router.post("/", createLostItem);
router.get("/", getAllLostItems);
router.get("/owner/:owner", getLostItemsByOwner);
router.get("/matchedItem/:matchedItem", getLostItemsByMatchedItem);
router.get("/school/:schoolId", getLostItemsBySchoolId);
router.get("/:id", getLostItemById);
router.put("/:id", updateLostItem);
router.delete("/all", deleteAllLostItems);
router.delete("/:id", deleteLostItem);

export default router; 