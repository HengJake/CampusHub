import mongoose from "mongoose";

const AttendanceRecordSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  status: { type: String, enum: ["present", "absent", "late"], required: true },
});

export const AttendanceRecord = mongoose.model("AttendanceRecord", AttendanceRecordSchema);