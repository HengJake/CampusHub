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
