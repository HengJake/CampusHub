import e from "express";
import { createPayment } from "../../controllers/Billing/payment.controllers.js";

const router = e.Router();

router.post("/", createPayment);

export default router;