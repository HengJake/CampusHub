// Programmer Name : Heng Jun Kai, Project Manager, Leader Full Stack developer
// Program Name: stop.model.js
// Description: Stop model schema defining transportation stop locations, coordinates, and accessibility information
// First Written on: July 7, 2024
// Edited on: Friday, July 10, 2024

import mongoose from "mongoose";

const stopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["dorm", "campus", "bus_station"],
      required: true,
    },
    image: {
      type: String,
      // URL to stop image
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

const Stop = mongoose.model("Stop", stopSchema);
export default Stop;
