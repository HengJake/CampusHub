import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["student", "lecturer", "companyAdmin", "schoolAdmin"],
      required: true,
    },
    twoFA_enabled: {type: Boolean, default: false},
  },
  {
    timestamps: true, // createAt , updatedAt
  }
);

// mongo will change User to users in the database
export const User = mongoose.model("User", userSchema);
