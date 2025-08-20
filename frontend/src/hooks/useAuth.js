import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/auth.js';

export const useAuth = () => {
    const {
        user,
        currentUser,
        schoolId,
        studentId,
        isAuthenticated,
        isLoading,
        logIn,
        logout,
        authorizeUser,
        getCurrentUser,
        getSchoolId,
        fetchSchoolData,
        clearAuth,
        fetchRoleSpecificData
    } = useAuthStore();

    const [schoolSetupComplete, setSchoolSetupComplete] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // Initialize auth state on mount
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const result = await authorizeUser();

                if (result.success && result.schoolSetupComplete !== undefined) {
                    setSchoolSetupComplete(result.schoolSetupComplete);
                }

            } catch (error) {
                console.log(error.message);
            } finally {
                setIsInitialized(true);
            }
        };

        initializeAuth();
    }, []);

    // Add school setup check
    const isSchoolSetupComplete = () => {
        if (isSchoolAdmin()) {
            const user = getCurrentUser();
            return user.schoolSetupComplete || schoolSetupComplete;
        }
        return true; // Non-school admins don't need school setup
    };

    // Role-based helpers
    const isSchoolAdmin = () => {
        const user = getCurrentUser();
        return user && user.role === 'schoolAdmin';
    };

    const isCompanyAdmin = () => {
        const user = getCurrentUser();
        return user && user.role === 'companyAdmin';
    };

    const isStudent = () => {
        const user = getCurrentUser();
        return user && user.role === 'student';
    };

    const isLecturer = () => {
        const user = getCurrentUser();
        return user && user.role === 'lecturer';
    };

    // Get schoolId with validation
    const getSchoolIdWithValidation = () => {
        const schoolId = getSchoolId();
        if (!schoolId) {
            throw new Error('School ID not available for current user');
        }
        return schoolId;
    };

    // Role-based data fetching
    const fetchSchoolDataWithAuth = async () => {
        if (!isSchoolAdmin() && !isStudent()) {
            throw new Error('User does not have access to school data');
        }
        return await fetchSchoolData();
    };

    // Enhanced login with role validation
    const loginWithRole = async (credentials, expectedRole) => {
        const result = await logIn(credentials, expectedRole);

        if (result.success) {
            // Additional role-specific initialization can be added here
            console.log(`Logged in as ${expectedRole}`);
        }

        return result;
    };

    // Check if user has access to specific features
    const hasAccess = (requiredRole) => {

        const user = getCurrentUser();
        if (!user || !user.role) return false;

        if (requiredRole === 'schoolAdmin') {
            return isSchoolAdmin() || isCompanyAdmin();
        }

        if (requiredRole === 'companyAdmin') {
            return isCompanyAdmin();
        }

        if (requiredRole === 'student') {
            return isStudent();
        }

        if (requiredRole === 'lecturer') {
            return isLecturer();
        }

        return false;
    };

    return {
        // State
        user: currentUser || user,
        schoolId,
        studentId,
        isAuthenticated,
        isLoading,
        isInitialized,

        // Actions
        logIn: loginWithRole,
        logout,
        authorizeUser,
        clearAuth,

        // Role checks
        isSchoolAdmin: isSchoolAdmin(),
        isCompanyAdmin: isCompanyAdmin(),
        isStudent: isStudent(),
        isLecturer: isLecturer(),

        // Helpers
        getCurrentUser,
        getSchoolId: getSchoolIdWithValidation,
        fetchSchoolData: fetchSchoolDataWithAuth,
        hasAccess,

        // Role-based context
        userRole: currentUser?.role || user?.role,
        userContext: {
            schoolId,
            studentId,
            role: currentUser?.role || user?.role,
            isAuthenticated
        },

        // School setup
        schoolSetupComplete,
        isSchoolSetupComplete: isSchoolSetupComplete(),
    };
}; 