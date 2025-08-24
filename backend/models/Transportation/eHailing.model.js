// Programmer Name : Heng Jun Kai, Project Manager, Leader Full Stack developer
// Program Name: eHailing.model.js
// Description: EHailing model schema defining ride-hailing service management, driver assignments, and trip coordination
// First Written on: July 10, 2024
// Edited on: Friday, July 10, 2024

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
