import { useAuthStore } from '../store/auth.js';
/**
 * Utility functions for JWT token detection and role-based redirection
 * Updated to work with HTTP-only cookies instead of localStorage
 */

/**
 * Check if JWT token exists in cookies
 * Note: Since tokens are HTTP-only cookies, we can't directly access them from JavaScript
 * We'll need to make an API call to check authentication status
 * @returns {Promise<boolean>} True if token exists and is valid
 */
export const hasValidToken = async () => {
    try {
        // Make a request to check if user is authenticated
        const res = await fetch('/auth/is-auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Include cookies
        });

        const data = await res.json();

        return data.success;
    } catch (error) {
        console.error('Error checking token validity:', error);
        return false;
    }
};

/**
 * Get user role from authentication endpoint
 * @returns {Promise<string|null>} User role or null if not available
 */
export const getRoleFromAuth = async () => {
    try {
        const res = await fetch('/auth/is-auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Include cookies
        });

        const data = await res.json();

        if (data.success && data.role) {
            return data.role;
        }

        return null;
    } catch (error) {
        console.error('Error getting role from auth:', error);
        return null;
    }
};

/**
 * Check if school setup is complete for schoolAdmin
 * @returns {Promise<boolean>} True if school setup is complete
 */
export const checkSchoolSetupComplete = async () => {
    try {
        const res = await fetch('/auth/is-auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Include cookies
        });

        const data = await res.json();
        console.log("🚀 ~ checkSchoolSetupComplete ~ data:", data)

        if (data.success && data.schoolId) {
            return true;
        }

        return false;
    } catch (error) {
        console.error('Error checking school setup:', error);
        return false;
    }
};

/**
 * Get appropriate redirect path based on user role and setup status
 * @param {string} role - User role
 * @param {boolean} isSchoolSetupComplete - Whether school setup is complete
 * @returns {string} Redirect path
 */
export const getRedirectPath = (role, isSchoolSetupComplete = true) => {
    switch (role) {
        case 'student':
            return '/user-dashboard';
        case 'schoolAdmin':
            return isSchoolSetupComplete ? '/admin-dashboard' : '/school-setup';
        case 'companyAdmin':
            return '/campushub-dashboard';
        case 'lecturer':
            // Lecturer functionality not implemented - redirect to homepage
            // Note: Toast message should be handled in the calling component
            return '/';
        default:
            return '/';
    }
};

/**
 * Main function to detect JWT token and redirect accordingly
 * @param {Function} navigate - React Router navigate function
 * @returns {Promise<Object>} Object with redirection info: { redirected: boolean, role?: string, isLecturer?: boolean }
 */
export const detectTokenAndRedirect = async (navigate) => {
    try {
        // Check if user is authenticated
        const isAuthenticated = await hasValidToken();
        if (!isAuthenticated) {
            return { redirected: false };
        }

        // Get user role from auth endpoint
        const role = await getRoleFromAuth();
        if (!role) {

            return { redirected: false };
        }



        // For schoolAdmin, check if school setup is complete
        let isSchoolSetupComplete = true;
        if (role === 'schoolAdmin') {
            isSchoolSetupComplete = await checkSchoolSetupComplete();

        }

        const redirectPath = getRedirectPath(role, isSchoolSetupComplete);


        // Navigate to appropriate page
        navigate(redirectPath);

        // Return info about the redirection, including if it's a lecturer
        return {
            redirected: true,
            role,
            isLecturer: role === 'lecturer'
        };
    } catch (error) {
        console.error('❌ Error in detectTokenAndRedirect:', error);
        return { redirected: false };
    }
};

/**
 * Initialize auth state from existing token
 * @returns {Promise<Object>} Auth initialization result
 */
export const initializeAuthFromToken = async () => {
    try {
        const { authorizeUser } = useAuthStore.getState();
        const result = await authorizeUser();

        if (result.success) {
            return {
                success: true,
                data: result.data,
                role: result.role,
                schoolId: result.schoolId
            };
        } else {
            return { success: false, message: result.message };
        }
    } catch (error) {
        console.error('Auth initialization error:', error);
        return { success: false, message: error.message };
    }
};

/**
 * Get comprehensive user data from auth endpoint
 * @returns {Promise<Object>} User data including role and school setup status
 */
export const getUserDataFromAuth = async () => {
    try {
        const res = await fetch('/auth/is-auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Include cookies
        });

        const data = await res.json();

        if (data.success) {
            return {
                success: true,
                role: data.role,
                schoolId: data.schoolId,
                schoolSetupComplete: data.schoolSetupComplete || false,
                user: data
            };
        } else {
            return { success: false, message: data.message };
        }
    } catch (error) {
        console.error('Error getting user data from auth:', error);
        return { success: false, message: error.message };
    }
};
