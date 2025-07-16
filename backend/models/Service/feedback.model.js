import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  feedbackType: {
    type: String,
    enum: ['complaint', 'compliment', 'suggestion', 'query', 'issue'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

const Feedback = mongoose.model('Feedback', feedbackSchema);
export default Feedback;
