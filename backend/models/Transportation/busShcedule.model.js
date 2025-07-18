import mongoose from "mongoose";

const busScheduleSchema = new mongoose.Schema(
  {
    RouteID: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Route",
        required: true,
      },
    ],
    VehicleID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicles",
      required: true,
    },
    DepartureTime: {
      type: Date,
      required: true,
    },
    ArrivalTime: {
      type: Date,
      required: true,
    },
    DayActive: {
      type: String,
      enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
      required: true,
    },
    Active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const BusSchedule = mongoose.model("BusSchedule", busScheduleSchema);
export default BusSchedule;