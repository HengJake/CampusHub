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
    const { schoolId, userId, subscriptionId } = data;

    // Check required fields
    if (!schoolId) {
        return {
            isValid: false,
            message: "schoolId is required"
        };
    }

    // Validate references exist
    const referenceValidation = await validateMultipleReferences({
        schoolId: { id: schoolId, Model: School },
        userId: { id: userId, Model: User },
        subscriptionId: { id: subscriptionId, Model: Subscription }
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

// Get Payments by Subscription
export const getPaymentsBySubscription = controllerWrapper(async (req, res) => {
    const { subscriptionId } = req.params;
    return await getAllRecords(
        Payment,
        "payments",
        ['SchoolID', 'UserID', 'SubscriptionID'],
        { SubscriptionID: subscriptionId }
    );
});

// Get Payments by Payment Method
export const getPaymentsByPaymentMethod = controllerWrapper(async (req, res) => {
    const { paymentMethod } = req.params;
    return await getAllRecords(
        Payment,
        "payments",
        ['SchoolID', 'UserID', 'SubscriptionID'],
        { PaymentMethod: paymentMethod }
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

export const deleteAllPayments = async (req, res) => {
    try {
        await Payment.deleteMany({});
        res.status(200).json({ message: 'All payments deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting all payments', error: error.message });
    }
};

