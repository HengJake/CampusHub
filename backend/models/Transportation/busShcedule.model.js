import mongoose from "mongoose";

const busScheduleSchema = new mongoose.Schema(
  {
    RouteID: [
      {
        type: Schema.Types.ObjectId,
        ref: "Route",
        required: true,
      },
    ],
    VehicleID: {
      type: Schema.Types.ObjectId,
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
      type: Number,
      enum: [1, 2, 3, 4, 5, 6, 7], // 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday, 7=Sunday
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