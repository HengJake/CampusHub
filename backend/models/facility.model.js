import mongoose from "mongoose";

const facilitySchema = new mongoose.Schema({
  name: String,
  type: {
    type: String,
    enum: ["parking", "gym", "court", "locker", "class", "room"],
  },
  location: String,
  available_slots: Number,
  sensors: [sensorSchema],
});
module.exports = mongoose.model("Facility", facilitySchema);