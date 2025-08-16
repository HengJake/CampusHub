import Payment from "../../models/Billing/payment.model.js";
import Subscription from "../../models/Billing/subscription.model.js";
import Invoice from "../../models/Billing/invoice.model.js";
import School from "../../models/Billing/school.model.js";

import {
    createRecord,
    getAllRecords,
    getRecordById,
    updateRecord,
    deleteRecord,
    validateReferenceExists,
    validateMultipleReferences,
    controllerWrapper
} from "../../utils/reusable.js";

const validateInvoiceData = async (data) => {
    const { paymentId, subscriptionId, schoolId, amount } = data;

    // Check required fields
    if (!paymentId) {
        return {
            isValid: false,
            message: "paymentId is required"
        };
    }
    if (!subscriptionId) {
        return {
            isValid: false,
            message: "subscriptionId is required"
        };
    }
    if (!schoolId) {
        return {
            isValid: false,
            message: "schoolId is required"
        };
    }
    if (!amount) {
        return {
            isValid: false,
            message: "amount is required"
        };
    }

    // Validate references exist
    const referenceValidation = await validateMultipleReferences({
        paymentId: { id: paymentId, Model: Payment },
        subscriptionId: { id: subscriptionId, Model: Subscription },
        schoolId: { id: schoolId, Model: School }
    });

    if (referenceValidation) {
        return {
            isValid: false,
            message: referenceValidation.message
        };
    }

    return { isValid: true };
};

export const createInvoice = controllerWrapper(async (req, res) => {
    return await createRecord(
        Invoice,
        req.body,
        "invoice",
        validateInvoiceData
    );
});

export const getAllInvoice = controllerWrapper(async (req, res) => {
    return await getAllRecords(Invoice, "invoice", ["paymentId", "subscriptionId", "schoolId"]);
});

export const getInvoiceById = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await getRecordById(Invoice, id, "invoice", ["paymentId", "subscriptionId", "schoolId"]);
});

// Get Invoices by Payment ID
export const getInvoicesByPaymentId = controllerWrapper(async (req, res) => {
    const { paymentId } = req.params;
    return await getAllRecords(
        Invoice,
        "invoices",
        ["paymentId", "subscriptionId", "schoolId"],
        { paymentId }
    );
});

// Get Invoices by Subscription ID
export const getInvoicesBySubscriptionId = controllerWrapper(async (req, res) => {
    const { subscriptionId } = req.params;
    return await getAllRecords(
        Invoice,
        "invoices",
        ["paymentId", "subscriptionId", "schoolId"],
        { subscriptionId }
    );
});

// Get Invoices by School ID
export const getInvoicesBySchoolId = controllerWrapper(async (req, res) => {
    const { schoolId } = req.params;
    return await getAllRecords(
        Invoice,
        "invoices",
        ["paymentId", "subscriptionId", "schoolId"],
        { schoolId }
    );
});

export const updateInvoice = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await updateRecord(Invoice, id, req.body, "invoice", validateInvoiceData);
});

export const deleteInvoice = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await deleteRecord(Invoice, id, "invoice");
});

export const deleteAllInvoices = async (req, res) => {
    try {
        await Invoice.deleteMany({});
        res.status(200).json({ message: 'All invoices deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting all invoices', error: error.message });
    }
};

