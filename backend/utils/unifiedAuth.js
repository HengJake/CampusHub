import User from '../models/Academic/user.model.js';
import bcrypt from 'bcrypt';
import generateToken from './jwtUtils.js';
import { generateTokenPayload, linkOAuthAccountHelper } from './authHelpers.js';


export const unifiedAuthentication = async (email, password = null, oauthData = null) => {
    try {
        console.log('unifiedAuthentication called with:', { email, password: password ? '***' : null, oauthData });

        // Find user by email
        const user = await User.findOne({ email });
        console.log('User found:', user ? { email: user.email, authProvider: user.authProvider, googleId: user.googleId } : null);

        if (!user) {
            console.log('User not found - handling new user creation');
            // User doesn't exist - handle based on context
            if (oauthData) {
                // OAuth login attempt for new user - create account
                return await createOAuthUser(oauthData);
            } else {
                // Local login attempt for non-existent user
                return {
                    success: false,
                    message: "Account not found. Please sign up first."
                };
            }
        }

        // User exists - handle authentication
        console.log('User exists - handling authentication method');
        if (oauthData) {
            console.log('OAuth authentication requested');
            // OAuth login for existing user
            return await handleOAuthLogin(user, oauthData);
        } else if (password) {
            console.log('Local authentication requested');
            // Local login for existing user
            return await handleLocalLogin(user, password);
        } else {
            console.log('No authentication method specified');
            return {
                success: false,
                message: "Invalid authentication method"
            };
        }
    } catch (error) {
        console.error('Unified authentication error:', error);
        return {
            success: false,
            message: "Authentication failed"
        };
    }
};

const createOAuthUser = async (oauthData) => {
    try {
        const newUser = new User({
            name: oauthData.name,
            email: oauthData.email,
            googleId: oauthData.provider === 'google' ? oauthData.providerId : undefined,
            role: oauthData.role || 'schoolAdmin', // Allow role selection
            authProvider: oauthData.provider,
            profilePicture: oauthData.profilePicture,
            linkedAccounts: [{
                provider: oauthData.provider,
                providerId: oauthData.providerId
            }]
        });

        await newUser.save();

        // Create role-specific records if needed
        if (newUser.role === 'student') {
            try {
                const Student = (await import('../models/Academic/student.model.js')).default;
                // For now, we'll skip creating the student record since it requires schoolId and intakeCourseId
                // The user will need to complete their profile setup later
                console.log('Student record creation skipped - requires school setup');
            } catch (studentError) {
                console.error('Error creating student record:', studentError);
                // Continue without student record for now
            }
        }

        // Generate token with role-specific payload
        const tokenPayload = await generateTokenPayload(newUser);

        const token = generateToken(newUser, tokenPayload);

        // Return complete user data with role-specific information
        const completeData = await getCompleteUserData(newUser, tokenPayload);
        return {
            success: true,
            message: "new_account_created",
            data: completeData,
            token: token
        };
    } catch (error) {
        return {
            success: false,
            message: "Failed to create account"
        };
    }
};

const handleOAuthLogin = async (user, oauthData) => {
    console.log('handleOAuthLogin - user:', {
        email: user.email,
        authProvider: user.authProvider,
        googleId: user.googleId,
        linkedAccounts: user.linkedAccounts
    });
    console.log('handleOAuthLogin - oauthData:', oauthData);

    // Check if OAuth account is already linked
    if (user.isOAuthLinked(oauthData.provider, oauthData.providerId)) {
        console.log('OAuth account already linked - proceeding with login');
        // OAuth account is linked - proceed with login
        const tokenPayload = await generateTokenPayload(user);

        const token = generateToken(user, tokenPayload);

        // Return complete user data with role-specific information
        const completeData = await getCompleteUserData(user, tokenPayload);
        return {
            success: true,
            message: "OAuth login successful",
            data: completeData,
            token: token
        };
    }

    // Also check if user has googleId that matches (for backward compatibility)
    if (user.googleId === oauthData.providerId && oauthData.provider === 'google') {
        console.log('Google ID matches - proceeding with login');
        // OAuth account is linked - proceed with login
        const tokenPayload = await generateTokenPayload(user);

        const token = generateToken(user, tokenPayload);

        // Return complete user data with role-specific information
        const completeData = await getCompleteUserData(user, tokenPayload);
        return {
            success: true,
            message: "OAuth login successful",
            data: completeData,
            token: token
        };
    }

    // OAuth account not linked - handle based on user type
    if (!user.authProvider || user.authProvider === 'local') {
        console.log('User has local account - attempting to auto-link OAuth');
        // User has local account (or no auth provider set) - automatically link OAuth
        try {
            const linkResult = await linkOAuthAccountHelper(user, oauthData);
            console.log('Link result:', linkResult);
            if (linkResult.success) {
                // Account linked successfully, proceed with login
                const tokenPayload = await generateTokenPayload(user);

                const token = generateToken(user, tokenPayload);

                // Return complete user data with role-specific information
                const completeData = await getCompleteUserData(user, tokenPayload);
                return {
                    success: true,
                    message: "OAuth account linked and login successful",
                    data: completeData,
                    token: token
                };
            } else {
                // Linking failed
                return {
                    success: false,
                    message: linkResult.message
                };
            }
        } catch (error) {
            console.error('Error auto-linking OAuth account:', error);
            return {
                success: false,
                message: "Failed to link OAuth account"
            };
        }
    }

    // User has different OAuth provider - offer to link
    return {
        success: false,
        message: "link_oauth_required",
        data: {
            user,
            oauthData,
            requiresLinking: true
        }
    };
};

const handleLocalLogin = async (user, password) => {
    // Check if user can login locally
    if (user.authProvider === 'google' && !user.password) {
        return {
            success: false,
            message: "This account was created with Google. Please use Google login."
        };
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
        return {
            success: false,
            message: "Invalid password"
        };
    }

    // Generate token with role-specific payload
    const tokenPayload = await generateTokenPayload(user);

    const token = generateToken(user, tokenPayload);

    // Return complete user data with role-specific information
    const completeData = await getCompleteUserData(user, tokenPayload);
    return {
        success: true,
        message: "Local login successful",
        data: completeData,
        token: token
    };
};

// Function to link OAuth account to existing local account
export const linkOAuthAccount = async (email, password, oauthData) => {
    try {


        const user = await User.findOne({ email });

        if (!user) {
            return {
                success: false,
                message: "Account not found"
            };
        }

        // Verify password for security
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return {
                success: false,
                message: "Invalid password"
            };
        }

        // Link the OAuth account using helper
        const linkResult = await linkOAuthAccountHelper(user, oauthData);
        if (!linkResult.success) {
            return linkResult;
        }

        // Generate token with role-specific payload
        const tokenPayload = await generateTokenPayload(user);

        const token = generateToken(user, tokenPayload);

        // Return complete user data with role-specific information
        const completeData = await getCompleteUserData(user, tokenPayload);
        return {
            success: true,
            message: "OAuth account linked successfully",
            data: completeData,
            token: token
        };
    } catch (error) {
        console.error('Link OAuth account error:', error);
        return {
            success: false,
            message: "Failed to link OAuth account"
        };
    }
};

// Helper function to get complete user data with role-specific information
async function getCompleteUserData(user, tokenPayload) {
    try {
        const completeData = {
            ...user.toObject(),
            schoolId: tokenPayload.schoolId || null,
            student: null,
            lecturer: null,
            school: null,
            schoolSetupComplete: tokenPayload.schoolSetupComplete || false
        };

        // Fetch role-specific data based on token payload
        if (tokenPayload.student) {
            const Student = (await import('../models/Academic/student.model.js')).default;
            const student = await Student.findById(tokenPayload.student);
            if (student) {
                completeData.student = student;
            }
        } else if (user.role === 'student') {
            // If no student record exists yet, create a placeholder
            completeData.student = {
                _id: null,
                userId: user._id,
                name: user.name,
                email: user.email,
                status: 'pending_setup',
                message: 'Student profile setup required',
                intakeCourseId: null // This will be null until profile is set up
            };
        }

        if (tokenPayload.lecturer) {
            const Lecturer = (await import('../models/Academic/lecturer.model.js')).default;
            const lecturer = await Lecturer.findById(tokenPayload.lecturer);
            if (lecturer) {
                completeData.lecturer = lecturer;
            }
        }

        if (tokenPayload.school) {
            const School = (await import('../models/Billing/school.model.js')).default;
            const school = await School.findById(tokenPayload.school);
            if (school) {
                completeData.school = school;
            }
        }

        return completeData;
    } catch (error) {
        console.error('Error getting complete user data:', error);
        // Return basic user data if there's an error
        return user.toObject();
    }
}
