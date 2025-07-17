import Payment from "../../models/Billing/payment.model.js";
import Subscription from "../../models/Billing/subscription.model.js";
import Invoice from "../../models/Billing/invoice.model.js";

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
import { get } from "mongoose";

const validateInvoiceData = async (data) => {
    const { paymentID, subscriptionID } = data;

    // Check required fields
    if (!paymentID) {
        return {
            isValid: false,
            message: "paymentID is required"
        };
    }
    if (!subscriptionID) {
        return {
            isValid: false,
            message: "subscriptionID is required"
        };
    }

    // Validate references exist
    const referenceValidation = await validateMultipleReferences({
        paymentID: { id: paymentID, Model: Payment },
        subscriptionID: { id: subscriptionID, Model: Subscription }
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
    return await getAllRecords(Invoice, "invoice", ["paymentID", "subscriptionID"]);
});

export const getInvoiceById = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await getRecordById(Invoice, id, "invoice", ["paymentID", "subscriptionID"]);
});

// Get Invoices by Payment ID
export const getInvoicesByPaymentId = controllerWrapper(async (req, res) => {
    const { paymentID } = req.params;
    return await getAllRecords(
        Invoice,
        "invoices",
        ["paymentID", "subscriptionID"],
        { paymentID }
    );
});

// Get Invoices by Subscription ID
export const getInvoicesBySubscriptionId = controllerWrapper(async (req, res) => {
    const { subscriptionID } = req.params;
    return await getAllRecords(
        Invoice,
        "invoices",
        ["paymentID", "subscriptionID"],
        { subscriptionID }
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

