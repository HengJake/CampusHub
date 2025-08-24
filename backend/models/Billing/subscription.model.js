// Programmer Name : Heng Jun Kai, Project Manager, Leader Full Stack developer
// Program Name: subscription.model.js
// Description: Subscription model schema defining service subscription plans, billing cycles, and plan management
// First Written on: July 8, 2024
// Edited on: Friday, July 10, 2024

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

