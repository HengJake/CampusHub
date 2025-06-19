import mongoose, { mongo } from "mongoose";

const vehiclesSchema = new Schema(
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
      enum: ["active", "inactive", "maintenance", "repair"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

const Vehicle = mongoose.model("Vehicle", vehiclesSchema);
export default Vehicle;
