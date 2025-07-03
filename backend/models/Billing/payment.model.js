import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    SchoolID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },
    CardHolderName: {
      type: String,
      required: true,
    },
    Last4Digit: {
      type: Number,
      required: true,
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
