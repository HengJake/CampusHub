import Users from "../models/users.model";
import mongoose from "mongoose";

export const createUser = async (req, res) => {
  const userData = req.body;
  // Validate userData here if necessary

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
