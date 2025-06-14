import mongoose from "mongoose";

const schoolAdminSchema = new mongoose.Schema(
  {
    schoolName: { type: String, required: true, default: "N/A" },
    institutionCode: { type: String, unique: true, default: "N/A" },
    // address: { type: String, default: "N/A" },
    // contactEmail: { type: String, default: "N/A" },
    // contactPhone: { type: String, default: "N/A" },
    // createdAt: { type: Date, default: Date.now },

    // subscription: {
    //   plan: {
    //     type: String,
    //     enum: ["Basic", "Standard", "Premium"],
    //     required: true,
    //     default: "Basic",
    //   },
    //   status: {
    //     type: String,
    //     enum: ["Active", "Expired", "Suspended"],
    //     default: "Active",
    //   },
    //   startDate: { type: Date, default: null },
    //   renewalDate: { type: Date, default: null },
    //   billingDate: { type: Date, default: null },
    // },

    // subAdmins: [
    //   { type: mongoose.Schema.Types.ObjectId, ref: "AdminUser", default: [] },
    // ],
    // paymentHistory: {
    //   type: [{ type: mongoose.Schema.Types.ObjectId, ref: "ClientPayment" }],
    //   default: [],
    // },
  },
  { timestamps: true }
);

const SchoolAdmin = mongoose.model("SchoolAdmin", schoolAdminSchema);
export default SchoolAdmin;
