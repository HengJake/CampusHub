import mongoose from "mongoose";

const ehailingRequestSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  pickup_location: String,
  destination: String,
  status: {
    type: String,
    enum: ["pending", "in_progress", "completed", "cancelled"],
    default: "pending",
  },
  driver_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

export default Ehailing = mongoose.model("EHailingRequest", ehailingRequestSchema);