import mongoose from "mongoose";

const eHailingSchema = new mongoose.Schema(
  {
    StudentID: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    RouteID: {
      type: Schema.Types.ObjectId,
      ref: "Route",
      required: true,
    },
    PickupLocation: {
      type: Schema.Types.ObjectId,
      ref: "Stop",
      required: true,
    },
    DropOffLocation: {
      type: Schema.Types.ObjectId,
      ref: "Stop",
      required: true,
    },
    Status: {
      type: String,
      enum: ["waiting", "in_progress", "completed", "cancelled", "delayed"],
      default: "waiting",
    },
    RequestAt: {
      type: Date,
      default: Date.now,
    },
    VehicleID: {
      type: Schema.Types.ObjectId,
      ref: "Vehicle",
    },
  },
  {
    timestamps: true,
  }
);

const EHailing = mongoose.model("EHailing", eHailingSchema);
export default EHailing;
