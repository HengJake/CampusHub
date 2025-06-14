import mongoose from "mongoose";

const lecturerSchema = new mongoose.Schema(
  {
    department: { type: String, default: "N/A" },

    // subjectsTaught: [
    //   { type: mongoose.Schema.Types.ObjectId, ref: "ClassSchedule" },
    // ],
    // assignedExams: [{ type: mongoose.Schema.Types.ObjectId, ref: "Exam" }],
    // studentsMonitored: [
    //   { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
    // ],
  },
  {
    timestamps: true,
  }
);

const Lecturer = mongoose.model("Lecturer", lecturerSchema);
export default Lecturer;
