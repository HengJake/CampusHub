import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  category: { type: String, enum: ["facility", "transport", "system"] },
  message: String,
  rating: { type: Number, min: 1, max: 5 },
  submitted_at: { type: Date, default: Date.now },
});
export default mongoose.model("Feedback", feedbackSchema);