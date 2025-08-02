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
