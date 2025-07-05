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
    const { PaymentID, SubscriptionID } = data;

    // Check required fields
    if (!PaymentID) {
        return {
            isValid: false,
            message: "PaymentID is required"
        };
    }
    if (!SubscriptionID) {
        return {
            isValid: false,
            message: "SubscriptionID is required"
        };
    }

    // Validate references exist
    const referenceValidation = await validateMultipleReferences({
        PaymentID: { id: PaymentID, Model: Payment },
        SubscriptionID: { id: SubscriptionID, Model: Subscription }
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