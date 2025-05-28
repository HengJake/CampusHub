import mongoose from "mongoose";

const AttendanceRecordSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  status: { type: String, enum: ["present", "absent", "late"], required: true },
});

const AcademicResultSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  course_code: { type: String, required: true },
  course_name: { type: String, required: true },
  grade: { type: Number, required: true },
  semester: { type: String, required: true },
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },
    verified: Boolean,
    twoFA_enabled: Boolean,
    apcard_balance: { type: Number, default: 0 },
    attendance_records: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Attendance", default: [] },
    ],
    academic_results: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AcademicResult",
        default: [],
      },
    ],
  },
  {
    timestamps: true, // createAt , updatedAt
  }
);

// mongo will change User to users in the database
const Users = mongoose.model("User", userSchema);
const Attendance = mongoose.model("Attendance", AttendanceRecordSchema);
const AcademicResult = mongoose.model("AcademicResult", AcademicResultSchema);

export { Users, Attendance, AcademicResult };
