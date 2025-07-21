import express from "express";
import {
  createFoundItem,
  getAllFoundItems,
  getFoundItemById,
  getFoundItemsBySubmittedBy,
  getFoundItemsByClaimedBy,
  updateFoundItem,
  deleteFoundItem,
  deleteAllFoundItems
} from "../../controllers/Service/foundItem.controllers.js";

const router = express.Router();

router.post("/", createFoundItem);
router.get("/", getAllFoundItems);
router.get("/:id", getFoundItemById);
router.get("/submittedBy/:submittedBy", getFoundItemsBySubmittedBy);
router.get("/claimedBy/:claimedBy", getFoundItemsByClaimedBy);
router.put("/:id", updateFoundItem);
router.delete("/all", deleteAllFoundItems);
router.delete("/:id", deleteFoundItem);

export default router; 