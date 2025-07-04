import Payment from "../../models/Billing/payment.model.js";
import User from "../../models/Academic/user.model.js";
import School from "../../models/Billing/school.model.js";
import Subscription from "../../models/Billing/subscription.model.js";
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

// Custom validation function for payment data
const validatePaymentData = async (data) => {
    const { SchoolID, UserID, SubscriptionID } = data;

    // Check required fields
    if (!SchoolID) {
        return {
            isValid: false,
            message: "SchoolID is required"
        };
    }

    // Validate references exist
    const referenceValidation = await validateMultipleReferences({
        schoolID: { id: SchoolID, Model: School },
        userID: { id: UserID, Model: User },
        subscriptionID: { id: SubscriptionID, Model: Subscription }
    });

    if (referenceValidation) {
        return {
            isValid: false,
            message: referenceValidation.message
        };
    }

    return { isValid: true };
};

// Create Payment
export const createPayment = controllerWrapper(async (req, res) => {
    return await createRecord(
        Payment,
        req.body,
        "payment",
        validatePaymentData
    );
});

// Get All Payments
export const getAllPayments = controllerWrapper(async (req, res) => {
    return await getAllRecords(
        Payment,
        "payments",
        ['schoolID']
    );
});

// Get Payment by ID
export const getPaymentById = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await getRecordById(
        Payment,
        id,
        "payment",
        ['schoolID']
    );
});

// Update Payment
export const updatePayment = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await updateRecord(
        Payment,
        id,
        req.body,
        "payment",
        validatePaymentData
    );
});

// Delete Payment
export const deletePayment = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await deleteRecord(Payment, id, "payment");
});

// Get Payments by School
export const getPaymentsBySchool = controllerWrapper(async (req, res) => {
    const { schoolId } = req.params;
    return await getAllRecords(
        Payment,
        "payments",
        ['SchoolID', 'UserID', 'SubscriptionID'],
        { SchoolID: schoolId }
    );
});

// Get Payments by User
export const getPaymentsByUser = controllerWrapper(async (req, res) => {
    const { userId } = req.params;
    return await getAllRecords(
        Payment,
        "payments",
        ['SchoolID', 'UserID', 'SubscriptionID'],
        { UserID: userId }
    );
});