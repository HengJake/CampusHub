import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: Number,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      enum: ["student", "lecturer", "companyAdmin", "schoolAdmin"],
      required: true,
    },
    twoFA_enabled: {
      type: Boolean,
      default: false,
    },
    verifyOtp: {
      type: String,
      default: "",
    },
    verifyOtpExpiresAt: {
      type: Number,
      default: 0,
    },
    resetOtp: {
      type: String,
      default: "",
    },
    resetOtpExpiresAt: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
