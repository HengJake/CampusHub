import e from "express";
import { createInvoice } from "../../controllers/Billing/invoice.controllers.js";

const router = e.Router();

router.post("/", createInvoice)

export default router;