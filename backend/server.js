import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import cookieParser from "cookie-parser";

// 1 Academic
import userRoutes from "./routes/Academic/user.routes.js";
import authRoutes from "./routes/auth.routes.js";
import studentRoutes from "./routes/Academic/student.routes.js";
import classScheduleRoutes from "./routes/Academic/classSchedule.routes.js";
import courseRoutes from "./routes/Academic/course.routes.js";
import departmentRoutes from "./routes/Academic/department.routes.js";
import examScheduleRoutes from "./routes/Academic/examSchedule.routes.js";
import intakeRoutes from "./routes/Academic/intake.routes.js";
import intakeCourseRoutes from "./routes/Academic/intakeCourse.routes.js";
import lecturerRoutes from "./routes/Academic/lecturer.routes.js";
import moduleRoutes from "./routes/Academic/module.routes.js";
import attendanceRoutes from "./routes/Academic/attendance.routes.js";
import resultRoutes from "./routes/Academic/result.routes.js";
import roomRoutes from "./routes/Academic/room.routes.js";

// 2 Billing
import subscriptionRoutes from "./routes/Billing/subscription.routes.js";
import paymentRoutes from "./routes/Billing/payment.routes.js";
import schoolRoutes from "./routes/Billing/school.routes.js";
import invoiceRoutes from "./routes/Billing/invoice.routes.js";

// 3 Transportation
import stopRoutes from "./routes/Transportation/stop.routes.js";
import busScheduleRoutes from "./routes/Transportation/busSchedule.routes.js";
import vehicleRoutes from "./routes/Transportation/vehicle.routes.js";
import routeRoutes from "./routes/Transportation/route.routes.js";
import eHailingRoutes from "./routes/Transportation/eHailing.routes.js";

// 4 Facility
import resourceRoutes from "./routes/Facility/resource.routes.js";
import bookingRoutes from "./routes/Facility/booking.routes.js";
import lockerUnitRoutes from "./routes/Facility/lockerUnit.routes.js";
import timeSlotRoutes from "./routes/Facility/timeSlot.routes.js";
import parkingLotRoutes from "./routes/Facility/parkingLot.routes.js";

// 5 Service
import feedbackRoutes from "./routes/Service/feedback.routes.js";
import respondRoutes from "./routes/Service/respond.routes.js";
import foundItemRoutes from "./routes/Service/foundItem.routes.js";
import lostItemRoutes from "./routes/Service/lostItem.routes.js";

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();

app.use(cookieParser());
app.use(express.json());

// 1 Academic
app.use("/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/class-schedule", classScheduleRoutes);
app.use("/api/course", courseRoutes);
app.use("/api/department", departmentRoutes);
app.use("/api/exam-schedule", examScheduleRoutes);
app.use("/api/intake", intakeRoutes);
app.use("/api/intake-course", intakeCourseRoutes);
app.use("/api/lecturer", lecturerRoutes);
app.use("/api/module", moduleRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/result", resultRoutes);
app.use("/api/room", roomRoutes);

// 2 Billing
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/school", schoolRoutes);
app.use("/api/invoice", invoiceRoutes);

// 3 Transportation
app.use("/api/stop", stopRoutes);
app.use("/api/bus-schedule", busScheduleRoutes);
app.use("/api/vehicle", vehicleRoutes);
app.use("/api/route", routeRoutes);
app.use("/api/e-hailing", eHailingRoutes);

// 4 Facility
app.use("/api/resource", resourceRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/locker-unit", lockerUnitRoutes);
app.use("/api/time-slot", timeSlotRoutes);
app.use("/api/parking-lot", parkingLotRoutes);

// 5 Service
app.use("/api/feedback", feedbackRoutes);
app.use("/api/respond", respondRoutes);
app.use("/api/found-item", foundItemRoutes);
app.use("/api/lost-item", lostItemRoutes);

app.listen(PORT, () => {
  connectDB();
  console.log("Server is running on port: " + PORT);
});