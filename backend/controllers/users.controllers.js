import { Users} from "../models/users.model.js";
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
    res.status(200).json({
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
