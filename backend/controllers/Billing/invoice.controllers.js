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
})