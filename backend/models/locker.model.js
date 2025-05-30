import mongoose from "mongoose";

const lockerSchema = new mongoose.Schema({
  facility_id: { type: mongoose.Schema.Types.ObjectId, ref: "Facility" },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  is_reserved: Boolean,
  reserved_until: Date,
});
module.exports = mongoose.model("Locker", lockerSchema);