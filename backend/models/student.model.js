import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    // studentId: { type: String, required: true, unique: true, default: "N/A" },
    // name: { type: String, required: true, default: "N/A" },
    // email: { type: String, required: true, unique: true, default: "N/A" },
    program: { type: String, default: "N/A" },
    year: { type: Number, default: 1 },

    // Facility Management
    // parkingSlotId: { type: mongoose.Schema.Types.ObjectId, ref: "ParkingSlot" },
    // gymLockerBooking: [{ type: mongoose.Schema.Types.ObjectId, ref: "GymLocker" }],
    // sportCourtBookings: [{ type: mongoose.Schema.Types.ObjectId, ref: "CourtBooking" }],
    // roomBookings: [{ type: mongoose.Schema.Types.ObjectId, ref: "RoomBooking" }],
    // lostFoundReports: [{ type: mongoose.Schema.Types.ObjectId, ref: "LostFoundItem" }],

    // Transport
    // transportScheduleView: { type: Boolean, default: false },
    // eHailingRides: [{ type: mongoose.Schema.Types.ObjectId, ref: "RideBooking" }],

    // Academic
    // lectureHallsVisited: [{ type: mongoose.Schema.Types.ObjectId, ref: "LectureHall" }],
    // academicSchedule: [{ type: mongoose.Schema.Types.ObjectId, ref: "ClassSchedule" }],
    // examSchedule: [{ type: mongoose.Schema.Types.ObjectId, ref: "Exam" }],
    // attendance: [{ type: mongoose.Schema.Types.ObjectId, ref: "AttendanceRecord" }],
    // results: [{ type: mongoose.Schema.Types.ObjectId, ref: "Result" }],

    // Student Feedback
    // feedbacks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Feedback" }],
  },
  {
    timestamps: true,
  }
);

const Student = mongoose.model("Student", studentSchema);
export default Student;
