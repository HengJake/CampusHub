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
