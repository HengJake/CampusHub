import mongoose from 'mongoose';

const schoolSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  adminIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  name: {
    type: String,
    required: true,
    unique: true,
  },
  address: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
    required: true,
  },
}, { timestamps: true });

const School = mongoose.model('School', schoolSchema);
export default School;