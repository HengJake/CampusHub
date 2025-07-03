import Payment from "../../models/Billing/payment.model.js";
import User from "../../models/Academic/user.model.js";
import School from "../../models/Billing/school.model.js";
import Subscription from "../../models/Billing/subscription.model.js";

export const createPayment = async (req, res) => {
    const paymentDetails = req.body;

    try {
        // Validate School
        const school = await School.findById(paymentDetails.SchoolID);
        if (!school) {
            return res.status(400).json({
                success: false,
                message: "Invalid SchoolID: school not found",
            });
        }

        const newPayment = new Payment({
            SchoolID: paymentDetails.SchoolID,
            CardHolderName: paymentDetails.CardHolderName,
            Last4Digit: paymentDetails.Last4Digit,
            PaymentMethod: paymentDetails.PaymentMethod,
        });

        const savedPayment = await newPayment.save();

        res.status(201).json({
            success: true,
            message: "Payment created successfully",
            data: savedPayment,
        });
    } catch (error) {
        console.error("Error creating payment:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create payment",
            error: error.message,
        });
    }
};