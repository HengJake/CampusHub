import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema({
    PaymentID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Payment",
        required: true,
    },
    SubscriptionID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subscription",
        required: true,
    },
    Amount: {
        type: Number,
        required: true,
    },
    Date: {
        type: Date,
        default: Date.now,
    },
    Status: {
        type: String,
        enum: ["pending", "paid", "overdue"],
        required: true,
    }
}, { timestamps: true });

const Invoice = mongoose.model("Invoice", invoiceSchema);
export default Invoice;