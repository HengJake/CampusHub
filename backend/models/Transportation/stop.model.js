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
      enum: ["dorm", "campus", "shopping_mall", "airport", "train_station"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Stop = mongoose.model("Stop", stopSchema);
export default Stop;
