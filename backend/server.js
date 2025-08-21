import express from "express";
import exceljs from "exceljs";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import cookieParser from "cookie-parser";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

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
import semesterRoutes from "./routes/Academic/semester.routes.js";
import schoolDataStatusRoutes from "./routes/schoolDataStatus.routes.js";

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
import parkingLotRoutes from "./routes/Facility/parkingLot.routes.js";

// 5 Service
import feedbackRoutes from "./routes/Service/feedback.routes.js";
import respondRoutes from "./routes/Service/respond.routes.js";
import lostItemRoutes from "./routes/Service/lostItem.routes.js";
import bugReportRoutes from "./routes/Service/bugReport.routes.js";

// At the top of your server.js
console.log('🚀 Server starting...');
console.log('📍 Current directory:', process.cwd());
console.log('🌍 Environment:', process.env.NODE_ENV);

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cookieParser());
app.use(express.json());

// CORS configuration
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000", "http://localhost:4173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));

// =-=-=-=-=-=-=-=-=

app.post("/export", async (req, res) => {
  const { columns, prefilledData, fileName } = req.body;

  try {
    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet(fileName);

    // header , key , width
    worksheet.columns = columns

    // Step 2: Style the header row
    const headerRow = worksheet.getRow(1); // First row is the header
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFD3D3D3" }, // light gray background
      };
      cell.font = {
        bold: true,
        color: { argb: "FF000000" }, // black text
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });


    prefilledData.forEach((item) => {
      worksheet.addRow({ ...item });
    });

    // Set CSV headers

    res.setHeader(
      "Content-Tydpe",
      "application/vnd. openxmlformats-officedocument.spreadsheetml.sheet")

    res.setHeader(
      "Content-Disposition",
      "attachment;filename=" + `${fileName}.xlsx`)

    await workbook.xlsx.write(res);

    res.end();
  } catch (error) {
    console.error(error.message);
    return res
      .status(400)
      .json({ success: false, message: error.message });

  }
})

// =-=-=-=-=-=-=-=-=

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
app.use("/api/semester", semesterRoutes);
app.use("/api/school-data-status", schoolDataStatusRoutes);

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
app.use("/api/parking-lot", parkingLotRoutes);

// 5 Service
app.use("/api/feedback", feedbackRoutes);
app.use("/api/respond", respondRoutes);
app.use("/api/lost-item", lostItemRoutes);
app.use("/api/bug-report", bugReportRoutes);


if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "..", 'frontend', 'dist')))
  console.log("🚀 ~ __dirname:", __dirname)

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "..", "frontend", "dist", "index.html"))
  })
}

// Add this to catch unhandled errors
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});


app.listen(PORT, () => {
  connectDB();
  console.log("Server is running on port: " + PORT);
});