import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    schoolID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },
    cardHolderName: {
      type: String,
      required: true,
    },
    last4Digit: {
      type: Number,
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
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
