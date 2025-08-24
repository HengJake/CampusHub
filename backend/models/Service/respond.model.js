// Programmer Name : Ritchie Boon Win Yew, Backend Developer
// Program Name: respond.model.js
// Description: Respond model schema defining response management for feedback, inquiries, and support ticket resolution
// First Written on: July 9, 2024
// Edited on: Friday, July 10, 2024

import mongoose from 'mongoose';

const respondSchema = new mongoose.Schema({
  feedbackId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Feedback',
    required: true
  },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  responderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

const Respond = mongoose.model('Respond', respondSchema);
export default Respond;
