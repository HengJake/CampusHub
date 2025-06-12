import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  Name: {
    type: String,
    required: true,
  },
  Password: {
    type: String,
    required: true,
  },
  PhoneNumber: {
    type: Number,
    required: true,
  },
  Email: {
    type: String,
    required: true,
    unique: true,
  },
  Role: {
    type: String,
    enum: ["student", "lecturer", "companyAdmin", "schoolAdmin"],
    required: true,
  },
  twoFA_enabled: {
    type: Boolean,
    default: false,
  },
}, {timestamps: true});

const User = mongoose.model("User", userSchema);
export default User;
