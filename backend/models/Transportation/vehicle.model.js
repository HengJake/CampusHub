import mongoose from "mongoose";

const vehiclesSchema = new Schema({
  plateNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  type: {
    type: String,
    enum: ['bus', 'van', 'car', 'motorcycle'],
    required: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance', 'repair'],
    default: 'active'
  }
}, {
  timestamps: true
});

const Vehicle = mongoose.model("Vehicle", vehiclesSchema);
export default Vehicle;