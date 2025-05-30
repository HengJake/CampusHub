import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  facility_id: { type: mongoose.Schema.Types.ObjectId, ref: "Facility" },
  time_slot: { start: Date, end: Date },
  status: {
    type: String,
    enum: ["booked", "cancelled", "completed"],
    default: "booked",
  },
  deposit_paid: Boolean,
});
module.exports = mongoose.model("Booking", bookingSchema);