import e from "express";
import {
    createPayment,
    getAllPayments,
    getPaymentById,
    updatePayment,
    deletePayment,
    getPaymentsBySchool,
    getPaymentsByUser
} from "../../controllers/Billing/payment.controllers.js";

const router = e.Router();

// Create a new payment
router.post("/", createPayment);

// Get all payments
router.get("/", getAllPayments);

// Get payment by ID
router.get("/:id", getPaymentById);

// Update payment by ID
router.put("/:id", updatePayment);

// Delete payment by ID
router.delete("/:id", deletePayment);

// Get payments by school ID
router.get("/school/:schoolId", getPaymentsBySchool);

// Get payments by user ID
router.get("/user/:userId", getPaymentsByUser);

export default router;