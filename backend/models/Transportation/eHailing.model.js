import mongoose from "mongoose";

const eHailingSchema = new mongoose.Schema(
  {
    studentID: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    routeID: {
      type: Schema.Types.ObjectId,
      ref: "Route",
      required: true,
    },
    pickupLocation: {
      type: Schema.Types.ObjectId,
      ref: "Stop",
      required: true,
    },
    dropOffLocation: {
      type: Schema.Types.ObjectId,
      ref: "Stop",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "in_progress", "completed", "cancelled"],
      default: "pending",
    },
    requestAt: {
      type: Date,
      default: Date.now,
    },
    vehiclesID: {
      type: Schema.Types.ObjectId,
      ref: "Vehicle",
    },
  },
  {
    timestamps: true,
  }
);

const EHailing = mongoose.Schema("EHailing", eHailingSchema);
export default EHailing;
