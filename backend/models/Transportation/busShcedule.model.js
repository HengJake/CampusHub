import mongoose from "mongoose";

const busScheduleSchema = new mongoose.Schema(
  {
    routeId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Route",
        required: true,
      },
    ],
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicles",
      required: true,
    },
    departureTime: {
      type: Date,
      required: true,
    },
    arrivalTime: {
      type: Date,
      required: true,
    },
    dayActive: {
      type: Number,
      enum: [1, 2, 3, 4, 5, 6, 7],
      required: true,
    },
    active: {
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