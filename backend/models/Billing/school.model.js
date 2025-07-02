import mongoose from 'mongoose';

const schoolSchema = new mongoose.Schema({
  UserID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  Name: {
    type: String,
    required: true,
  },
  Address: {
    type: String,
    required: true,
  },
  City: {
    type: String,
    required: true,
  },
  Country: {
    type: String,
    required: true,
  },
  Status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
    required: true,
  },
}, { timestamps: true });

const School = mongoose.model('School', schoolSchema);
export default School;