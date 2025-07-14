import mongoose from "mongoose";

const vehiclesSchema = new mongoose.Schema(
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
      enum: ["bus", "minibus", "private_car", "van", "motorcycle"],
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
  },
  {
    timestamps: true,
  }
);

const Vehicle = mongoose.model("Vehicle", vehiclesSchema);
export default Vehicle;
