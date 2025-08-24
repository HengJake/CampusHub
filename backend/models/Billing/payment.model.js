// Programmer Name : Ritchie Boon Win Yew, Backend Developer
// Program Name: payment.model.js
// Description: Payment model schema defining payment processing, transaction records, and financial reconciliation
// First Written on: July 9, 2024
// Edited on: Friday, July 10, 2024

import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },
    cardHolderName: {
      type: String,
      required: true,
    },
    last4Digit: {
      type: String,
      required: true,
    },
    expiryDate: {
      type: String,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["VISA", "MasterCard", "PayPal"],
      required: true,
    },
    status: {
      type: String,
      enum: ["success", "failed", "refunded"],
      default: "success"
    }
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
