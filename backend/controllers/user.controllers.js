import User from "../models/user.model.js";
import mongoose from "mongoose";

export const createUser = async (req, res) => {
  const { name, password, phoneNumber, email, role, twoFA_enabled } = req.body;

  // Validate required fields
  if (!name || !password || !phoneNumber || !email || !role) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide all required fields" });
  }

  // validate phone number
  // validate password
  // validate email

  const newUser = new User({
    name,
    password,
    phoneNumber,
    email,
    role,
    twoFA_enabled: twoFA_enabled || false,
  });

  try {
    await newUser.save();
    res
      .status(201)
      .json({
        success: true,
        data: newUser,
        message: "User created successfully",
      });
  } catch (error) {
    console.error("Error in createUser:", error.message);

    // Handle duplicate email/phone error
    if (error.code === 11000) {
      const duplicateKey = Object.keys(error.keyPattern)[0]; // e.g., 'email' or 'phoneNumber'

      return res.status(409).json({
        success: false,
        message: `${
          duplicateKey.charAt(0).toUpperCase() + duplicateKey.slice(1)
        } already exists`,
      });
    }

    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // validate email

  // Basic input check
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide both email and password",
    });
  }

  try {
    // Find user by email
    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Login success
    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: user
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getUserById = async (req, res) => {
  const { id } = req.params;

  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID format",
    });
  }

  try {
    const user = await User.findById(id).select("-password"); // Exclude password

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
