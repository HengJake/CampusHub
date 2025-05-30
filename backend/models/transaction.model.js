import mongoose from "mongoose";
import { AcademicResult } from "./users.model";

const topUpTransactionSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  amount: Number,
  method: { type: String, enum: ["card", "online_banking"] },
  timestamp: { type: Date, default: Date.now },
});
module.exports = mongoose.model("TopUpTransaction", topUpTransactionSchema);

const academicScheduleSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  week: String,
  events: [{ title: String, description: String, date: Date }],
});
export default academicSchedule = mongoose.model("AcademicSchedule", academicScheduleSchema);