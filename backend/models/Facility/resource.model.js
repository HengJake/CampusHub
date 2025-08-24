// Programmer Name : Ritchie Boon Win Yew, Backend Developer
// Program Name: resource.model.js
// Description: Resource model schema defining facility resource management, availability tracking, and resource allocation
// First Written on: July 8, 2024
// Edited on: Friday, July 10, 2024

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
  status: { type: Boolean, default: true }, // active or inactive
  timeslots: [
    {
      dayOfWeek: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        required: true
      },
      slots: [
        {
          start: { type: String, required: true }, // "09:00"
          end: { type: String, required: true },   // "10:00"
        }
      ]
    }
  ]
}, { timestamps: true });

export default mongoose.model('Resource', ResourceSchema);