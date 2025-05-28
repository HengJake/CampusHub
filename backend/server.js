import express, { application } from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import { Users, Attendance, AcademicResult } from "./models/users.model.js";

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();
// allow json in requests
app.use(express.json());

// app.get("/CampusHub", (req, res) => {
//     res.send("Server is ready!");
// })
// ================Handle users===============
app.post("/api/Users", async (req, res) => {
  const userData = req.body;
  // Validate userData here if necessary
  if (!userData.name || !userData.email || !userData.password) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid user data" });
  } else if (await Users.findOne({ email: userData.email })) {
    return res
      .status(400)
      .json({ success: false, message: "Email already exists" });
  }

  const newUser = new Users(userData);

  try {
    await newUser.save();
    res.status(201).json({
      message: "User created successfully",
      data: newUser,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ===============add attendance and to user attendance==============
app.post("/api/Users/:id/Attendances", async (req, res) => {
  const userID = req.params.id;
  const attendanceData = req.body;

  try {
    // create attendance record
    const newAttendance = new Attendance({
      date: attendanceData.date,
      status: attendanceData.status,
    });

    const savedAttendance = await newAttendance.save();

    // add attendance record to user
    const updatedUser = await Users.findByIdAndUpdate(
      userID,
      { $push: { attendance_records: savedAttendance._id } },
      { new: true }
    );
    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    console.error("Error creating attendance record:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ===============add result and to user result==============
app.post("/api/Users/:id/Results", async (req, res) => {
  const userID = req.params.id;
  const resultData = req.body;

  try {
    // create academic result record
    const newResult = new AcademicResult({
      date: resultData.date,
      course_code: resultData.course_code,
      course_name: resultData.course_name,
      grade: resultData.grade,
      semester: resultData.semester,
    });

    const savedResult = await newResult.save();

    // add result record to user
    const updatedUser = await Users.findByIdAndUpdate(
      userID,
      { $push: { academic_results: savedResult._id } },
      { new: true }
    );
    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    console.error("Error creating attendance record:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.listen(PORT, () => {
  connectDB();
  console.log("Server is running on port: " + PORT);
});
