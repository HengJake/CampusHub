// Programmer Name : Ritchie Boon Win Yew, Backend Developer
// Program Name: school.model.js
// Description: School model schema defining educational institution information, billing policies, and financial configuration
// First Written on: July 7, 2024
// Edited on: Friday, July 10, 2024

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
  prefix: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    minlength: 2,
    maxlength: 10,
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