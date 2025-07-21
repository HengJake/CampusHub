import e from "express";
import {
    createInvoice,
    getAllInvoice,
    getInvoiceById,
    updateInvoice,
    deleteInvoice,
    deleteAllInvoices
} from "../../controllers/Billing/invoice.controllers.js";

const router = e.Router();

// Create a new invoice
router.post("/", createInvoice);

// Get all invoices
router.get("/", getAllInvoice);

// Get invoice by ID
router.get("/:id", getInvoiceById);

// Update invoice by ID
router.put("/:id", updateInvoice);

router.delete("/all", deleteAllInvoices);
// Delete invoice by ID
router.delete("/:id", deleteInvoice);

export default router;