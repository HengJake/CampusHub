import mongoose from "mongoose";

const transportScheduleSchema = new mongoose.Schema({
  route_name: String,
  stops: [String],
  timings: [String],
  capacity: Number,
});

const Transport = mongoose.model("TransportSchedule", transportScheduleSchema);
export default Transport;