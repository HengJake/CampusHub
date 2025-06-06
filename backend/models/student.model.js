const studentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  studentId: { type: String, required: true },
  program: String,
  faculty: String,
  year: Number,
  apCardBalance: { type: Number, default: 0 },
  classSchedule: [
    {
      subject: String,
      startTime: Date,
      endTime: Date,
      location: String,
    },
  ],
});
