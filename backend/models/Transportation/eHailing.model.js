import mongoose from "mongoose";

const eHailingSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    routeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Route",
      required: true,
    },
    status: {
      type: String,
      enum: ["waiting", "in_progress", "completed", "cancelled", "delayed"],
      default: "waiting",
    },
    requestAt: {
      type: Date,
      default: Date.now,
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
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

const EHailing = mongoose.model("EHailing", eHailingSchema);
export default EHailing;
