import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
  plan: {
    type: String,
    enum: ["Basic", "Standard", "Premium"],
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  billingInterval: {
    type: String,
    enum: ["Monthly", "Yearly"],
    required: true,
  },
});

export default mongoose.model("Subscription", subscriptionSchema);

