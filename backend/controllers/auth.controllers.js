import User from "../models/Academic/user.model.js";
import bcrypt from "bcrypt";
import generateToken from "../utils/jwtUtils.js";
import transporter from "../config/nodemailer.js";
import mongoose from "mongoose";
import School from "../models/Billing/school.model.js";
import Student from "../models/Academic/student.model.js";
import jwt from "jsonwebtoken";
import Lecturer from "../models/Academic/lecturer.model.js";

export const register = async (req, res) => {
  const { name, password, phoneNumber, email, role, twoFA_enabled } = req.body;

  // Validate required fields
  if (!name || !password || !phoneNumber || !email || !role) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide all required fields" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // validate phone number
  // validate password
  // validate email

  const newUser = new User({
    name,
    password: hashedPassword,
    phoneNumber,
    email,
    role,
    twoFA_enabled: twoFA_enabled || false,
  });

  try {
    await newUser.save();

    let extraInfo = {};
    if (role === "schoolAdmin") {
      const school = await School.findOne({ userId: newUser._id });
      if (school) {
        extraPayload.schoolId = school._id;
      }
    } else if (role === "student") {
      const student = await Student.findOne({ userId: newUser._id });
      if (student) {
        extraPayload.schoolId = student.schoolId;
        extraPayload.studentId = student._id;
      }
    }

    const token = generateToken(newUser, extraPayload);

    // add token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // sending welcome email
    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Welcome to CampusHub",
      text: `Welcome to CampusHub website, Your account has been successfully created with email : ${email}`,
    };

    await transporter.sendMail(mailOption);

    return res.status(201).json({
      success: true,
      data: newUser,
      message: "User register successfully",
    });
  } catch (error) {
    console.error("Error in register user :", error.message);

    // Handle duplicate email/phone error
    if (error.code === 11000) {
      const duplicateKey = Object.keys(error.keyPattern)[0]; // e.g., 'email' or 'phoneNumber'

      return res.status(409).json({
        success: false,
        message: `${duplicateKey.charAt(0).toUpperCase() + duplicateKey.slice(1)
          } already exists`,
      });
    }

    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Basic input check
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide both email and password",
    });
  }

  try {
    const user = await User.findOne({ email });

    // Check if user exists first
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Now it's safe to compare passwords
    const matchPassword = await bcrypt.compare(password, user.password);

    if (!matchPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    let extraPayload = {};
    if (user.role === "schoolAdmin") {
      const school = await School.findOne({ userId: user._id });
      if (school) {
        extraPayload.schoolId = school._id;
      }
    } else if (user.role === "student") {
      const student = await Student.findOne({ userId: user._id });
      if (student) {
        extraPayload.schoolId = student.schoolId;
        extraPayload.studentId = student._id;
      }
    }

    const token = generateToken(user, extraPayload);

    // add token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Login success
    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: user,
      token: token,
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });

    return res.status(201).json({
      success: true,
      message: "Log Out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// sends otp to user
export const sendVerifyOtp = async (req, res) => {
  try {
    const { id } = req.body;

    const user = await User.findById(id).select("-password");

    if (user.twoFA_enabled) {
      return res.status(404).json({
        success: false,
        message: "Account already verified",
      });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.verifyOtp = otp;
    user.verifyOtpExpiresAt = Date.now() + 24 * 60 * 60 * 1000;

    await user.save();

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Account Verification OTP",
      text: `Your OTP is ${otp}. Please verify your account using this OTP.`,
    };

    await transporter.sendMail(mailOption);

    return res.status(201).json({
      success: true,
      message: `Verification OTP send to ${user.email}`,
      otp: otp,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// verify the email using OTP
export const verifyEmail = async (req, res) => {
  const { id, otp } = req.body;

  if (!id || !otp) {
    return res
      .status(400)
      .json({ success: false, message: "Please enter an OTP" });
  }

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.verifyOtp === "" || user.verifyOtp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (user.verifyOtpExpiresAt < Date.now()) {
      return res
        .status(400)
        .json({ success: false, message: "OTP has expired" });
    }

    user.twoFA_enabled = true;
    user.verifyOtp = "";
    user.verifyOtpExpiresAt = 0;

    await user.save();
    return res.status(201).json({
      success: true,
      message: "Email has been verified",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const isAuthenticated = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    // Enhanced response based on user role
    let responseData = {
      success: true,
      message: "User is authenticated",
      id: user._id,
      role: user.role,
      email: user.email,
      twoFA_enabled: user.twoFA_enabled
    };

    // Add role-specific data
    if (user.role === "schoolAdmin") {

      const school = await School.findOne({ userId: user._id });
      // For schoolAdmin, include schoolId
      responseData.schoolId = school._id;
      responseData.school = school._id; // For backward compatibility

    } else if (user.role === "student") {
      // For student, include schoolId and student details
      const student = await Student.findOne({ userId: user._id });

      if (student) {
        responseData.schoolId = student.schoolId;
        responseData.student = {
          _id: student._id,
          name: user.name,
          studentId: student._id,
          schoolId: student.schoolId,
          intakeCourseId: student.intakeCourseId,
          status: student.status
        };
      }
    } else if (user.role === "lecturer") {
      // For lecturer, include schoolId
      const lecturer = await Lecturer.findOne({ userId: user._id });
      if (lecturer) {
        responseData.schoolId = lecturer.schoolId;
        responseData.lecturer = {
          _id: lecturer._id,
          name: user.name,
          schoolId: lecturer.schoolId,
          departmentId: lecturer.departmentId
        };
      }
    }

    res.json(responseData);
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({
      success: false,
      message: "Invalid token"
    });
  }
};

export const sendResetOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ success: false, message: "Email is required" });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.resetOtp = otp;
    user.resetOtpExpiresAt = Date.now() + 15 * 60 * 1000;
    await user.save();

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is ${otp}. Please verify your account using this OTP.`,
    };
    await transporter.sendMail(mailOption);

    return res.status(201).json({
      success: true,
      message: "OTP send has been sent to your email",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Email, OTP and new password is required",
    });
  }
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.resetOtp === "" || user.resetOtp !== otp) {
      return res.status(404).json({ success: false, message: "Invalid OTP" });
    }

    if (user.resetOtpExpiresAt < Date.now()) {
      return res
        .status(404)
        .json({ success: false, message: "OTP has expired" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpiresAt = 0;

    await user.save();

    return res.status(201).json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

