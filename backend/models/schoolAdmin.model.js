import mongoose from "mongoose";

const schoolAdminSchema = new mongoose.Schema(
  {
    _id: ObjectId,
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    companyName: String,
    contactNumber: String,
    departments: [String],
    permissions: [String], // e.g. ["manageParking", "manageReports"]
  },
 {
    timestamps: true, // createAt , updatedAt
  }
);
