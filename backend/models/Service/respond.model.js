import mongoose from 'mongoose';

const respondSchema = new mongoose.Schema({
  feedbackId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Feedback',
    required: true
  },
  message: {
    type: String,
    required: true
  }
});

const Respond = mongoose.model('Respond', respondSchema);
export default Respond;
