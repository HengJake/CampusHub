import mongoose from "mongoose";

const routeTimingSchema = new mongoose.Schema({
  routeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Route",
    required: true,
  },
  startTime: {
    type: String, // Format: "HH:MM"
    required: true,
  },
  endTime: {
    type: String, // Format: "HH:MM"
    required: true,
  }
});

const busScheduleSchema = new mongoose.Schema(
  {
    routeTiming: [
      {
        type: routeTimingSchema,
        required: true,
      },
    ],
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },
    dayOfWeek: {
      type: Number,
      enum: [1, 2, 3, 4, 5, 6, 7], // Monday=1, Sunday=7
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const BusSchedule = mongoose.model("BusSchedule", busScheduleSchema);
export default BusSchedule;