// Programmer Name : Heng Jun Kai, Project Manager, Leader Full Stack developer
// Program Name: vehicle.model.js
// Description: Vehicle model schema defining transportation vehicle details, capacity, maintenance status, and operational information
// First Written on: July 9, 2024
// Edited on: Friday, July 10, 2024

import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    plateNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    type: {
      type: String,
      enum: ["bus", "car"],
      required: true,
    },
    // to record how many people the vehicle can afford
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ["available", "in_service", "under_maintenance", "inactive"],
      default: "available",
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

const Vehicle = mongoose.model("Vehicle", vehicleSchema);
export default Vehicle;
