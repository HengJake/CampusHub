import e from "express";
import {
    createSubscription,
    getAllSubscription,
    getSubscriptionById,
    updateSubscription,
    deleteSubscription
} from "../../controllers/Billing/subscription.controllers.js";

const router = e.Router();

// Create a new subscription
router.post("/", createSubscription);

// Get all subscriptions
router.get("/", getAllSubscription);

// Get subscription by ID
router.get("/:id", getSubscriptionById);

// Update subscription by ID
router.put("/:id", updateSubscription);

// Delete subscription by ID
router.delete("/:id", deleteSubscription);

export default router;