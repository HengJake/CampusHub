import e from "express";
import { createSubscription, readAllSubscriptions, readSubscription } from "../../controllers/Billing/subscription.controllers.js";

const router = e.Router();

router.post("/", createSubscription);
router.get("/", readAllSubscriptions);
router.get("/:id", readSubscription);

export default router;