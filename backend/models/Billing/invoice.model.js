// Programmer Name : Heng Jun Kai, Project Manager, Leader Full Stack developer
// Program Name: invoice.model.js
// Description: Invoice model schema defining billing document generation, payment terms, and financial record keeping
// First Written on: July 10, 2024
// Edited on: Friday, July 10, 2024

import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema({
    paymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Payment",
        required: true,
    },
    subscriptionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subscription",
        required: true,
    },
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "School",
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ["pending", "paid", "overdue"],
        default: "paid",
    }
}, { timestamps: true });

const Invoice = mongoose.model("Invoice", invoiceSchema);
export default Invoice;