import mongoose from "mongoose";

const ResourceSchema = new mongoose.Schema({
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    name: { type: String, required: true },
    location: { type: String, required: true },
    type: {
      type: String,
      enum: ['locker', 'court', 'study_room', 'meeting_room', 'seminar_room'],
      required: true,
    },
    capacity: { type: Number, default: 1 },
    timeslotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Timeslot',
    },
    status: { type: Boolean, default: true }, // active or inactive
  });
  
  module.exports = mongoose.model('Resource', ResourceSchema);