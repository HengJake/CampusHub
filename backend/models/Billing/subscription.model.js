import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true,
  },
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
}, { timestamps: true });

export default mongoose.model("Subscription", subscriptionSchema);

