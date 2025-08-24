import express from "express";
import {
  createLostItem,
  getAllLostItems,
  getLostItemById,
  getLostItemsByOwner,
  getLostItemsByMatchedItem,
  getLostItemsByStudentId,
  getLostItemsBySchoolId,
  updateLostItem,
  deleteLostItem,
  deleteAllLostItems,
  matchLostItems
} from "../../controllers/Service/lostItem.controllers.js";

const router = express.Router();

router.post("/", createLostItem);
router.post("/match", matchLostItems);
router.get("/", getAllLostItems);
router.get("/owner/:owner", getLostItemsByOwner);
router.get("/student/:studentId", getLostItemsByStudentId);
router.get("/matchedItem/:matchedItem", getLostItemsByMatchedItem);
router.get("/school/:schoolId", getLostItemsBySchoolId);
router.get("/:id", getLostItemById);
router.put("/:id", updateLostItem);
router.delete("/all", deleteAllLostItems);
router.delete("/:id", deleteLostItem);

export default router; 