import e from "express";
import {
    createSubscription,
    getAllSubscription,
    getSubscriptionById,
    updateSubscription,
    deleteSubscription,
    getSubscriptionBySchool
} from "../../controllers/Billing/subscription.controllers.js";
import { deleteAllSubscriptions } from '../../controllers/Billing/subscription.controllers.js';


const router = e.Router();

// Create a new subscription
router.post("/", createSubscription);

// Get all subscriptions
router.get("/", getAllSubscription);

// Get subscription by ID
router.get("/:id", getSubscriptionById);

// Get subscriptions by school ID
router.get("/school/:schoolId", getSubscriptionBySchool);

// Update subscription by ID
router.put("/:id", updateSubscription);

router.delete('/all', deleteAllSubscriptions);
// Delete subscription by ID
router.delete("/:id", deleteSubscription);

export default router;