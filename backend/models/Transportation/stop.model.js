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
