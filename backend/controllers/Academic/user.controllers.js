import User from "../../models/Academic/user.model.js";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import generateToken from "../../utils/jwtUtils.js";
import { verifyToken } from "../../utils/authMiddleware.js";

export const createUser = async (req, res) => {
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
    res.status(201).json({
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

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({});

    return res.status(200).json({
      success: true,
      data: users,
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

export const checkExistedUserDetails = async (req, res) => {
  try {
    const { name, email, phoneNumber } = req.body;

    if (!name && !email && !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Please provide username, email, or phoneNumber to check.",
      });
    }

    const takenFields = {};

    if (name) {
      const userByUsername = await User.findOne({ name }).select("_id");
      if (userByUsername) takenFields.name = true;
    }

    if (email) {
      const userByEmail = await User.findOne({ email }).select("_id");
      if (userByEmail) takenFields.email = true;
    }

    if (phoneNumber) {
      const userByPhone = await User.findOne({ phoneNumber }).select("_id");
      if (userByPhone) takenFields.phoneNumber = true;
    }

    const anyTaken = Object.keys(takenFields).length > 0;

    return res.status(200).json({
      success: true,
      exist: anyTaken,
      takenFields,
      message: anyTaken
        ? "User details are already taken."
        : "All provided details are available.",
    });
  } catch (error) {
    console.error("Error checking user existence:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const modifyUser = async (req, res) => {
  const { id } = req.params;
  const userDetails = req.body;

  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID format",
    });
  }

  // Check for duplicate email or phoneNumber
  try {
    if (userDetails.email) {
      const emailExists = await User.findOne({
        email: userDetails.email,
        _id: { $ne: id },
      });
      if (emailExists) {
        return res.status(409).json({
          success: false,
          message: "Email is already in use by another user.",
        });
      }
    }
    if (userDetails.phoneNumber) {
      const phoneExists = await User.findOne({
        phoneNumber: userDetails.phoneNumber,
        _id: { $ne: id },
      });
      if (phoneExists) {
        return res.status(409).json({
          success: false,
          message: "Phone number is already in use by another user.",
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(id, userDetails, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedUser,
      message: "User updated successfully",
    });
  } catch (error) {
    console.error("Error updating user:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID format",
    });
  }

  try {
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
