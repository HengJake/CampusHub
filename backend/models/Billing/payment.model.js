import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    UserID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    SchoolID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
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
    PaymentDate: {
      type: Date,
      default: Date.now,
    },
    PaymentMethod: {
      type: String,
      enum: ["VISA", "MasterCard", "PayPal"],
      required: true,
    },
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
