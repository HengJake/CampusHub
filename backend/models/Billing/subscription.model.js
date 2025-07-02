import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
  Plan: {
    type: String,
    enum: ["Basic", "Standard", "Premium"],
    required: true,
  },
  Price: {
    type: Number,
    required: true,
  },
  BillingInterval: {
    type: String,
    enum: ["Monthly", "Yearly"],
    required: true,
  },
});

export default mongoose.model("Subscription", subscriptionSchema);

