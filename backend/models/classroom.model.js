import mongoose from "mongoose";

const classroomSchema = new mongoose.Schema({
  building: String,
  room_number: String,
  capacity: Number,
  equipment: [String],
  schedule: [
    {
      day: String,
      start_time: String,
      end_time: String,
      booked_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
  ],
});
export default Classroom = mongoose.model("Classroom", classroomSchema);