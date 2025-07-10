import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        // Full name of the user (student, lecturer, admin)
    },
    
    password: {
        type: String,
        required: true,
        // Encrypted password for authentication
    },
    
    phoneNumber: {
        type: Number,
        required: true,
        // Contact phone number (unique per user)
    },
    
    email: {
        type: String,
        required: true,
        // Email address for communication and login
    },
    
    role: {
        type: String,
        enum: ["student", "lecturer", "companyAdmin", "schoolAdmin"],
        required: true,
        // User role determines access permissions and functionality
    },
    
    twoFA_enabled: {
        type: Boolean,
        default: false,
        // Two-factor authentication status
    },
    
    verifyOtp: {
        type: String,
        default: "",
        // One-time password for email verification
    },
    
    verifyOtpExpiresAt: {
        type: Number,
        default: 0,
        // Expiration timestamp for email verification OTP
    },
    
    resetOtp: {
        type: String,
        default: "",
        // One-time password for password reset
    },
    
    resetOtpExpiresAt: {
        type: Number,
        default: 0,
        // Expiration timestamp for password reset OTP
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ phoneNumber: 1 });
userSchema.index({ role: 1 });

const User = mongoose.model("User", userSchema);
export default User;