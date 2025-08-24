// Programmer Name : Heng Jun Kai, Project Manager, Leader Full Stack developer
// Program Name: feedback.model.js
// Description: Feedback model schema defining user feedback collection, rating systems, and service improvement tracking
// First Written on: July 8, 2024
// Edited on: Friday, July 10, 2024

import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  feedbackType: {
    type: String,
    enum: ['complaint', 'compliment', 'suggestion', 'query', 'issue'],
    required: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: "Medium"
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['sent', 'open', 'in_progress', 'resolved', 'closed'],
    default: 'sent',
  }
}, {
  timestamps: true
});

const Feedback = mongoose.model('Feedback', feedbackSchema);
export default Feedback;
