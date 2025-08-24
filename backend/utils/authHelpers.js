// Programmer Name : Heng Jun Kai, Project Manager, Leader Full Stack developer
// Program Name: authHelpers.js
// Description: Authentication helper functions for token payload generation, OAuth account linking, and authentication workflow management
// First Written on: July 15, 2024
// Edited on: Friday, August 17, 2024

import School from '../models/Billing/school.model.js';
import Student from '../models/Academic/student.model.js';
import Lecturer from '../models/Academic/lecturer.model.js';

// Consolidated function to generate token payload based on user role
export const generateTokenPayload = async (user) => {
    let tokenPayload = {};

    try {
        // Fetch role-specific data based on user role
        if (user.role === "schoolAdmin") {
            const school = await School.findOne({ userId: user._id });
            if (school) {
                tokenPayload = {
                    schoolId: school._id,
                    school: school._id,
                    user: user._id,
                    schoolSetupComplete: true,
                };
            } else {
                tokenPayload = {
                    schoolId: null,
                    school: null,
                    schoolSetupComplete: false,
                    user: user._id
                };
            }
        } else if (user.role === "student") {
            const student = await Student.findOne({ userId: user._id });
            const school = await School.findOne({ _id: student?.schoolId });
            if (student) {
                tokenPayload = {
                    schoolId: student.schoolId,
                    student: student._id,
                    school: school?._id,
                    user: user._id
                };
            } else {
                // New student user without student record yet
                tokenPayload = {
                    user: user._id,
                    role: "student"
                };
            }
        } else if (user.role === "lecturer") {
            const lecturer = await Lecturer.findOne({ userId: user._id });
            if (lecturer) {
                tokenPayload = {
                    schoolId: lecturer.schoolId,
                    lecturer: lecturer._id,
                    school: lecturer.schoolId,
                    user: user._id
                };
            } else {
                // New lecturer user without lecturer record yet
                tokenPayload = {
                    user: user._id,
                    role: "lecturer"
                };
            }
        }

        // Ensure we always return at least the user ID
        if (!tokenPayload.user) {
            tokenPayload.user = user._id;
        }

        return tokenPayload;
    } catch (error) {
        console.error('Error generating token payload:', error);
        return { user: user._id };
    }
};

// Consolidated function to handle OAuth account linking
export const linkOAuthAccountHelper = async (user, oauthData) => {
    try {


        // Allow linking Google to local accounts or updating existing Google accounts
        if (user.authProvider && user.authProvider !== 'local' && user.authProvider !== oauthData.provider) {

            return {
                success: false,
                message: `This account is already linked to ${user.authProvider}`
            };
        }

        // Use the model's linkOAuthAccount method for proper linking
        user.linkOAuthAccount(oauthData.provider, oauthData.providerId);

        // Update profile information if available
        if (oauthData.name && !user.name) {
            user.name = oauthData.name;
        }



        await user.save();

        return {
            success: true,
            message: "OAuth account linked successfully",
            data: user
        };
    } catch (error) {
        console.error('Error linking OAuth account:', error);
        return {
            success: false,
            message: "Failed to link OAuth account"
        };
    }
};

// Consolidated function to check if OAuth linking is required
export const checkOAuthLinkingRequired = (user, authProvider) => {
    if (user.authProvider && user.authProvider !== authProvider) {
        return {
            requiresLinking: true,
            message: "link_oauth_required",
            data: {
                user: {
                    email: user.email,
                    role: user.role
                },
                oauthData: {
                    provider: authProvider,
                    providerId: user.googleId || null,
                    email: user.email,
                    name: user.name
                }
            }
        };
    }

    return { requiresLinking: false };
};
