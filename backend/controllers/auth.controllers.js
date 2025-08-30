// Programmer Name : Heng Jun Kai, Project Manager, Leader Full Stack developer
// Program Name: auth.controllers.js
// Description: Authentication controller handling user login, registration, password management, and JWT token operations
// First Written on: July 13, 2024
// Edited on: Friday, July 18, 2024

import User from "../models/Academic/user.model.js";
import bcrypt from "bcrypt";
import generateToken from "../utils/jwtUtils.js";
import transporter from "../config/nodemailer.js";
import jwt from "jsonwebtoken";
import { generateTokenPayload, linkOAuthAccountHelper, checkOAuthLinkingRequired } from "../utils/authHelpers.js";
import School from "../models/Billing/school.model.js";
import Student from "../models/Academic/student.model.js";
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

    let tokenPayload = {};

    // Fetch role-specific data based on user role
    if (newUser.role === "schoolAdmin") {
      const school = await School.findOne({ userId: newUser._id });
      if (school) {
        tokenPayload = {
          schoolId: school._id,
          school: school,
          schoolSetupComplete: true,
          user: newUser
        };
      } else {
        tokenPayload = {
          schoolId: null,
          school: null,
          schoolSetupComplete: false,
          user: newUser
        };
      }
    } else if (newUser.role === "student") {
      const student = await Student.findOne({ userId: newUser._id });
      const school = await School.findOne({ _id: student?.schoolId });
      if (student) {
        tokenPayload = {
          schoolId: student.schoolId,
          student: student,
          school: school,
          user: newUser
        };
      }
    } else if (newUser.role === "lecturer") {
      const lecturer = await Lecturer.findOne({ userId: newUser._id });
      if (lecturer) {
        tokenPayload = {
          schoolId: lecturer.schoolId,
          lecturer: {
            _id: lecturer._id,
            name: newUser.name,
            schoolId: lecturer.schoolId,
            departmentId: lecturer.departmentId
          },
          user: newUser
        };
      }
    }

    const token = generateToken(newUser, tokenPayload);

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

    return res.status(500).json({ success: false, message: "Server Error" });
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

    // Check if user is an OAuth user (no password field)
    if (!user.password) {
      return res.status(401).json({
        success: false,
        message: "This account was created with Google. Please use the 'Sign in with Google' option instead.",
      });
    }

    // Now it's safe to compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }


    let tokenPayload = {};

    // Fetch role-specific data based on user role - only include essential IDs
    if (user.role === "schoolAdmin") {
      const school = await School.findOne({ userId: user._id });
      if (school) {
        tokenPayload = {
          schoolId: school._id,
          school: school._id,
          user: user._id,
          schoolSetupComplete: true,
        };
      } else {
        tokenPayload = {
          schoolId: null,
          school: null,
          user: user._id,
          schoolSetupComplete: false
        };
      }
    } else if (user.role === "student") {
      const student = await Student.findOne({ userId: user._id });
      if (student) {
        tokenPayload = {
          schoolId: student.schoolId,
          student: student._id,
          school: student.schoolId,
          user: user._id
        };
      }
    } else if (user.role === "lecturer") {
      const lecturer = await Lecturer.findOne({ userId: user._id });
      if (lecturer) {
        tokenPayload = {
          schoolId: lecturer.schoolId,
          lecturerId: lecturer._id,
          user: user._id
        };
      }
    }

    const token = generateToken(user, tokenPayload);

    // add token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      data: user,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Error in login user :", error.message);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// OAuth login method for Google, Facebook, etc.
export const loginWithOAuth = async (req, res) => {
  const { email, googleId, authProvider } = req.body;

  // Basic input check
  if (!email || !googleId || !authProvider) {
    return res.status(400).json({
      success: false,
      message: "Please provide email, googleId, and authProvider",
    });
  }

  try {
    // Find user by email or googleId
    const user = await User.findOne({
      $or: [
        { email: email },
        { googleId: googleId }
      ]
    });

    // Check if user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "OAuth user not found. Please sign up first.",
      });
    }

    // Check if user has a different auth provider - allow account linking
    const linkingCheck = checkOAuthLinkingRequired(user, authProvider);
    if (linkingCheck.requiresLinking) {
      // Update the providerId in the data
      linkingCheck.data.oauthData.providerId = googleId;

      return res.status(401).json({
        success: false,
        message: linkingCheck.message,
        data: linkingCheck.data
      });
    }

    // If user exists but doesn't have an authProvider set, update it
    if (!user.authProvider) {
      user.authProvider = authProvider;
      user.googleId = googleId;
      await user.save();
    }

    const tokenPayload = await generateTokenPayload(user);

    const token = generateToken(user, tokenPayload);

    // add token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      data: user,
      message: "OAuth login successful",
    });
  } catch (error) {
    console.error("Error in OAuth login:", error.message);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// OAuth signup method for Google, Facebook, etc.
export const signupWithOAuth = async (req, res) => {
  const { email, googleId, authProvider, name, role = "schoolAdmin" } = req.body;

  // Basic input check
  if (!email || !googleId || !authProvider || !name) {
    return res.status(400).json({
      success: false,
      message: "Please provide email, googleId, authProvider, and name",
    });
  }

  try {
    // Check if user already exists with this email
    const existingUserByEmail = await User.findOne({ email: email });
    if (existingUserByEmail) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Check if user already exists with this googleId
    const existingUserByGoogleId = await User.findOne({ googleId: googleId });
    if (existingUserByGoogleId) {
      return res.status(409).json({
        success: false,
        message: "User with this Google account already exists",
      });
    }

    // Create new OAuth user
    const newUser = new User({
      email,
      googleId,
      authProvider,
      name,
      role,
      // OAuth users are automatically verified (no password needed)
      // Detect OAuth user by presence of googleId and authProvider
      profilePicture: req.body.profilePicture || "",
      phoneNumber: req.body.phoneNumber || "",
      twoFA_enabled: false,
      // No password field for OAuth users
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET
    );

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Return success response
    return res.status(201).json({
      success: true,
      message: "OAuth user registered successfully",
      data: {
        _id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        authProvider: newUser.authProvider,
        googleId: newUser.googleId,
        profilePicture: newUser.profilePicture,
        phoneNumber: newUser.phoneNumber,
        twoFA_enabled: newUser.twoFA_enabled,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
        // Detect if user is OAuth-based by checking for googleId and authProvider
        isOAuthUser: !!(newUser.googleId && newUser.authProvider),
        // OAuth users are considered verified since they come from trusted providers
        isVerified: !!(newUser.googleId && newUser.authProvider)
      },
      token,
    });
  } catch (error) {
    console.error("OAuth signup error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during OAuth signup",
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
    return res.status(500).json({ success: false, message: "Server Error" });
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

    // Calculate token expiration time
    const currentTime = Math.floor(Date.now() / 1000);
    const tokenExp = decoded.exp;
    const timeLeft = tokenExp - currentTime;

    // Convert to hours and minutes
    const hoursLeft = Math.floor(timeLeft / 3600);
    const minutesLeft = Math.floor((timeLeft % 3600) / 60);

    // Enhanced response based on user role with data fetched from database
    let responseData = {
      success: true,
      message: "User is authenticated",
      id: user._id,
      role: user.role,
      email: user.email,
      user: user,
      twoFA_enabled: user.twoFA_enabled,
      tokenExpiration: {
        expiresAt: new Date(tokenExp * 1000),
        timeLeft: {
          total: timeLeft,
          hours: hoursLeft,
          minutes: minutesLeft
        }
      }
    };

    // Fetch role-specific data from database using IDs from JWT token
    // Find school by user ID instead of relying on decoded.schoolId
    const school = await School.findOne({ userId: user._id });
    if (school) {
      responseData.schoolId = school._id;
      responseData.school = school;
      responseData.schoolSetupComplete = true;
    } else {
      responseData.schoolId = null;
      responseData.school = null;
      responseData.schoolSetupComplete = false;
    }

    if (decoded.student !== undefined) {
      responseData.student = decoded.student;

      // Fetch student data if studentId exists
      if (decoded.student) {
        const student = await Student.findById(decoded.student);
        if (student) {
          responseData.student = student;

          // Set schoolId for students
          if (student.schoolId) {
            responseData.schoolId = student.schoolId;
          }

          // Also fetch school data for students if not already fetched
          if (student.schoolId && !responseData.school) {
            const school = await School.findById(student.schoolId);
            if (school) {
              responseData.school = school;
            }
          }
        }
      }
    }

    if (decoded.lecturerId !== undefined) {
      responseData.lecturerId = decoded.lecturerId;

      // Fetch lecturer data if lecturerId exists
      if (decoded.lecturerId) {
        const lecturer = await Lecturer.findById(decoded.lecturerId);
        if (lecturer) {
          responseData.lecturer = lecturer;

          // Also fetch school data for lecturers if not already fetched
          if (lecturer.schoolId && !responseData.school) {
            const school = await School.findById(lecturer.schoolId);
            if (school) {
              responseData.school = school;
            }
          }
        }
      }
    }

    return res.json(responseData);
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({
      success: false,
      message: "Invalid token"
    });
  }
};

export const sendResetOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
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
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const verifyResetOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({
      success: false,
      message: "Email and OTP are required",
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
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (user.resetOtpExpiresAt < Date.now()) {
      return res
        .status(400)
        .json({ success: false, message: "OTP has expired" });
    }

    // OTP is valid, but don't reset it yet - just verify
    return res.status(200).json({
      success: true,
      message: "OTP verification successful",
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const checkExistingOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Check if user has a valid OTP
    const hasValidOtp = user.resetOtp &&
      user.resetOtp !== "" &&
      user.resetOtpExpiresAt &&
      user.resetOtpExpiresAt > Date.now();

    return res.status(200).json({
      success: true,
      hasValidOtp: hasValidOtp,
      message: hasValidOtp ? "Valid OTP found" : "No valid OTP found",
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ success: false, message: "Server Error" });
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
        .status(400)
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
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get token duration information
export const getTokenDuration = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Calculate token expiration time
    const currentTime = Math.floor(Date.now() / 1000);
    const tokenExp = decoded.exp;
    const timeLeft = tokenExp - currentTime;

    // Convert to different time units
    const daysLeft = Math.floor(timeLeft / 86400);
    const hoursLeft = Math.floor((timeLeft % 86400) / 3600);
    const minutesLeft = Math.floor((timeLeft % 3600) / 60);
    const secondsLeft = timeLeft % 60;

    return res.status(200).json({
      success: true,
      tokenExpiration: {
        expiresAt: new Date(tokenExp * 1000),
        timeLeft: {
          total: timeLeft,
          days: daysLeft,
          hours: hoursLeft,
          minutes: minutesLeft,
          seconds: secondsLeft
        },
        isExpired: timeLeft <= 0
      }
    });
  } catch (error) {
    console.error("Token duration error:", error);
    return res.status(401).json({
      success: false,
      message: "Invalid token"
    });
  }
};

// Google validation endpoint for account termination
export const validateGoogleForTermination = async (req, res) => {
  const { email, googleId, name, profilePicture, provider, providerId } = req.body;

  // Basic input check
  if (!email || !googleId || !provider) {
    return res.status(400).json({
      success: false,
      message: "Please provide email, googleId, and provider",
    });
  }

  try {
    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found with this email address",
      });
    }

    // Check if user has Google authentication enabled
    if (!user.googleId && !user.authProvider) {
      return res.status(401).json({
        success: false,
        message: "This account was not created with Google authentication. Please use password verification instead.",
      });
    }

    // Verify Google ID matches (if user has googleId stored)
    if (user.googleId && user.googleId !== googleId) {
      return res.status(401).json({
        success: false,
        message: "Google account verification failed. Please try again or use password verification.",
      });
    }

    // If user doesn't have googleId stored but has authProvider, allow verification
    // This handles cases where users might have linked accounts later
    if (!user.googleId && user.authProvider === 'google') {
      // Update user with Google ID for future reference
      user.googleId = googleId;
      await user.save();
    }

    // Authentication successful
    return res.status(200).json({
      success: true,
      message: "Google authentication successful",
      data: {
        userId: user._id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    });

  } catch (error) {
    console.error("Error in Google validation for termination:", error.message);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};