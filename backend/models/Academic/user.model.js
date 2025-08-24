// Programmer Name : Heng Jun Kai, Project Manager, Leader Full Stack developer
// Program Name: user.model.js
// Description: User model schema defining user authentication and profile data structure with role-based access control
// First Written on: June 28, 2024
// Edited on: Friday, July 5, 2024

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
        required: function () {
            // Password only required if not using OAuth
            return !this.authProvider || this.authProvider === 'local';
        },
        // Encrypted password for local authentication
    },

    phoneNumber: {
        type: Number,
    },

    email: {
        type: String,
        required: true,
        // Email address for communication and login
    },

    role: {
        type: String,
        enum: ["student", "lecturer", "companyAdmin", "schoolAdmin", "researcher", "staff", "guest"],
        required: true,
        // User role determines access permissions and functionality
    },

    // OAuth fields
    authProvider: {
        type: String,
        enum: ['local', 'google', 'facebook', 'github', 'hybrid'], // Add 'hybrid' for linked accounts
        default: 'local',
        // Tracks how user authenticated
    },

    googleId: {
        type: String,
        sparse: true, // Allow multiple users without googleId
    },

    // Add linked accounts tracking
    linkedAccounts: [{
        provider: {
            type: String,
            enum: ['google', 'facebook', 'github']
        },
        providerId: String,
        linkedAt: {
            type: Date,
            default: Date.now
        }
    }],

    profilePicture: {
        type: String,
        // URL to profile image from OAuth provider
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

// Add method to link OAuth account
userSchema.methods.linkOAuthAccount = function (provider, providerId) {
    // Check if account is already linked
    const existingLink = this.linkedAccounts.find(link =>
        link.provider === provider && link.providerId === providerId
    );

    if (!existingLink) {
        this.linkedAccounts.push({
            provider,
            providerId,
            linkedAt: new Date()
        });

        // Update auth provider to hybrid if linking multiple methods
        if (this.authProvider !== 'hybrid') {
            this.authProvider = this.authProvider === 'local' ? provider : 'hybrid';
        }

        if (provider === 'google') {
            this.googleId = providerId;
        }
    }

    return this;
};

// Add method to check if OAuth account is linked
userSchema.methods.isOAuthLinked = function (provider, providerId) {
    return this.linkedAccounts.some(link =>
        link.provider === provider && link.providerId === providerId
    );
};

// Indexes for better query performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ phoneNumber: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ authProvider: 1 }); // New index for auth method
userSchema.index({ email: 1, authProvider: 1 }); // Compound index for OAuth lookups

const User = mongoose.model("User", userSchema);
export default User;