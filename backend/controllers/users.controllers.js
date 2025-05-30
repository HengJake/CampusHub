import { Users, Attendance, AcademicResult } from "../models/users.model.js";
import mongoose from "mongoose";

//Create New User
export const createUser = async (req, res) => {
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
    res.status(500).json({ message: "Internal server error" });
  }
};

//Read User
export const getUser = async (req, res) => {
  try {
    const user = await Users.find({});
    res.status(200).json({success: true, data: user});
  } catch (error) {
    console.log("Error fetching users:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  };


//Update User
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const user = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(404)
      .json({ success: false, message: "Invalid User ID" });
  }

  try {
    const updatedUser = await Users.findByIdAndUpdate(id, user, {
      new: true,
    });
    res.status(200).json({success: true, data: updatedUser});
  }catch (error) {
    console.log("Error updating user:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }

};


//Delete User
export const deleteUser = async (req, res) => {
  const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
      .status(404)
      .json({ success: false, message: "Invalid ID" });
    }

    try {
      await Users.findByIdAndDelete(id);
      res.status(200)
      .json({ success: true, message: "User deleted successfully" });
    }  catch (error) {
      console.log("Error deleting user:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

//---------------------------------------------------------------------------------


// Create Attendance Record
export const createAttendance = async (req, res) => {
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
};

// Create Academic Result Record
export const createAcademicResult = async (req, res) => {
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
};

