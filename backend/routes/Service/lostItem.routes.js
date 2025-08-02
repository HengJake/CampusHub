import express from "express";
import {
  createLostItem,
  getAllLostItems,
  getLostItemById,
  getLostItemsByOwner,
  getLostItemsByMatchedItem,
  updateLostItem,
  deleteLostItem,
  deleteAllLostItems
} from "../../controllers/Service/lostItem.controllers.js";

const router = express.Router();

router.post("/", createLostItem);
router.get("/", getAllLostItems);
router.get("/:id", getLostItemById);
router.get("/owner/:owner", getLostItemsByOwner);
router.get("/matchedItem/:matchedItem", getLostItemsByMatchedItem);
router.put("/:id", updateLostItem);
router.delete("/all", deleteAllLostItems);
router.delete("/:id", deleteLostItem);

export default router; 