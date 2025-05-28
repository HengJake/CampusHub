const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: {
    type: String,
    enum: ["student", "admin", "staff"],
    default: "student",
  },
  verified: Boolean,
  twoFA_enabled: Boolean,
  apcard_balance: { type: Number, default: 0 },
  attendance_records: [
    {
      date: Date,
      status: { type: String, enum: ["present", "absent", "late"] },
    },
  ],
  academic_results: [{ course_code: String, grade: String, semester: String }],
});
module.exports = mongoose.model("User", userSchema);

const sensorSchema = new mongoose.Schema({
  is_occupied: Boolean,
  last_updated: Date,
});
const facilitySchema = new mongoose.Schema({
  name: String,
  type: {
    type: String,
    enum: ["parking", "gym", "court", "locker", "class", "room"],
  },
  location: String,
  available_slots: Number,
  sensors: [sensorSchema],
});
module.exports = mongoose.model("Facility", facilitySchema);

const bookingSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  facility_id: { type: mongoose.Schema.Types.ObjectId, ref: "Facility" },
  time_slot: { start: Date, end: Date },
  status: {
    type: String,
    enum: ["booked", "cancelled", "completed"],
    default: "booked",
  },
  deposit_paid: Boolean,
});
module.exports = mongoose.model("Booking", bookingSchema);

const lockerSchema = new mongoose.Schema({
  facility_id: { type: mongoose.Schema.Types.ObjectId, ref: "Facility" },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  is_reserved: Boolean,
  reserved_until: Date,
});
module.exports = mongoose.model("Locker", lockerSchema);

const transportScheduleSchema = new mongoose.Schema({
  route_name: String,
  stops: [String],
  timings: [String],
  capacity: Number,
});
module.exports = mongoose.model("TransportSchedule", transportScheduleSchema);

const ehailingRequestSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  pickup_location: String,
  destination: String,
  status: {
    type: String,
    enum: ["pending", "in_progress", "completed", "cancelled"],
    default: "pending",
  },
  driver_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});
module.exports = mongoose.model("EHailingRequest", ehailingRequestSchema);

const classroomSchema = new mongoose.Schema({
  building: String,
  room_number: String,
  capacity: Number,
  equipment: [String],
  schedule: [
    {
      day: String,
      start_time: String,
      end_time: String,
      booked_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
  ],
});
module.exports = mongoose.model("Classroom", classroomSchema);

const topUpTransactionSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  amount: Number,
  method: { type: String, enum: ["card", "online_banking"] },
  timestamp: { type: Date, default: Date.now },
});
module.exports = mongoose.model("TopUpTransaction", topUpTransactionSchema);

const academicScheduleSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  week: String,
  events: [{ title: String, description: String, date: Date }],
});
module.exports = mongoose.model("AcademicSchedule", academicScheduleSchema);

const notificationSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  title: String,
  message: String,
  is_read: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now },
});
module.exports = mongoose.model("Notification", notificationSchema);

const feedbackSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  category: { type: String, enum: ["facility", "transport", "system"] },
  message: String,
  rating: { type: Number, min: 1, max: 5 },
  submitted_at: { type: Date, default: Date.now },
});
module.exports = mongoose.model("Feedback", feedbackSchema);

const dashboardMetricSchema = new mongoose.Schema({
  metric_name: String,
  value: Number,
  calculated_at: Date,
});
module.exports = mongoose.model("DashboardMetric", dashboardMetricSchema);
