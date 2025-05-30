import mongoose from "mongoose";

const transportScheduleSchema = new mongoose.Schema({
  route_name: String,
  stops: [String],
  timings: [String],
  capacity: Number,
});

export default TransportSchedule = mongoose.model("TransportSchedule", transportScheduleSchema);