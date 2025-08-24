// Programmer Name : Ritchie Boon Win Yew, Backend Developer
// Program Name: route.model.js
// Description: Route model schema defining transportation route paths, stop sequences, and route optimization
// First Written on: July 8, 2024
// Edited on: Friday, July 10, 2024

import mongoose from "mongoose";

// Route schema
const routeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    stopIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Stop",
        required: true,
      },
    ],
    estimateTimeMinute: {
      type: Number,
      required: true,
      min: 0,
    },
    fare: {
      type: Number,
      required: true,
      min: 0,
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

const Route = mongoose.model("Route", routeSchema);
export default Route;
