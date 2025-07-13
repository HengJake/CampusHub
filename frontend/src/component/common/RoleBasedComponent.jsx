import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Box, Spinner, Alert, AlertIcon, AlertTitle, AlertDescription } from '@chakra-ui/react';

/**
 * RoleBasedComponent - A wrapper component that provides role-based context
 * and automatically handles schoolId for schoolAdmin operations
 * 
 * @param {Object} props
 * @param {string} props.requiredRole - Required role to access this component
 * @param {React.ReactNode} props.children - Child components to render
 * @param {boolean} props.showLoading - Whether to show loading state
 * @param {React.ReactNode} props.loadingComponent - Custom loading component
 * @param {React.ReactNode} props.unauthorizedComponent - Custom unauthorized component
 * @param {Function} props.onAuthSuccess - Callback when auth is successful
 * @param {Function} props.onAuthError - Callback when auth fails
 */
const RoleBasedComponent = ({
    requiredRole,
    children,
    showLoading = true,
    loadingComponent,
    unauthorizedComponent,
    onAuthSuccess,
    onAuthError,
    ...props
}) => {
    const {
        isAuthenticated,
        isInitialized,
        isLoading,
        userRole,
        schoolId,
        hasAccess,
        getSchoolId
    } = useAuth();

    const [authError, setAuthError] = useState(null);

    useEffect(() => {
        if (isInitialized && !isLoading) {
            if (isAuthenticated && hasAccess(requiredRole)) {
                // Validate schoolId for schoolAdmin operations
                if (requiredRole === 'schoolAdmin' || requiredRole === 'student') {
                    try {
                        const currentSchoolId = getSchoolId();
                        if (currentSchoolId) {
                            setAuthError(null);
                            onAuthSuccess?.({ schoolId: currentSchoolId, role: userRole });
                        } else {
                            throw new Error('School ID not available');
                        }
                    } catch (error) {
                        setAuthError('School ID not available for current user');
                        onAuthError?.(error);
                    }
                } else {
                    setAuthError(null);
                    onAuthSuccess?.({ role: userRole });
                }
            } else {
                setAuthError('Access denied. Insufficient permissions.');
                onAuthError?.({ message: 'Access denied' });
            }
        }
    }, [isInitialized, isLoading, isAuthenticated, userRole, schoolId, requiredRole, hasAccess, getSchoolId, onAuthSuccess, onAuthError]);

    // Show loading state
    if (!isInitialized || isLoading) {
        if (showLoading) {
            return loadingComponent || (
                <Box flex={1}>
                    <Spinner size="lg" color="blue.500" />
                </Box>
            );
        }
        return null;
    }

    // Show unauthorized state
    if (!isAuthenticated || !hasAccess(requiredRole) || authError) {
        if (unauthorizedComponent) {
            return unauthorizedComponent;
        }

        return (
            <Alert status="error" variant="subtle" flexDirection="column" alignItems="center" justifyContent="center" textAlign="center" height="200px">
                <AlertIcon boxSize="40px" mr={0} />
                <AlertTitle mt={4} mb={1} fontSize="lg">
                    Access Denied
                </AlertTitle>
                <AlertDescription maxWidth="sm">
                    {authError || 'You do not have permission to access this resource.'}
                </AlertDescription>
            </Alert>
        );
    }

    // Render children with role-based context
    return (
        <Box {...props} flex={1}>
            {children}
        </Box>
    );
};

/**
 * SchoolAdminComponent - Specialized wrapper for schoolAdmin components
 * Automatically handles schoolId validation and injection
 */
export const SchoolAdminComponent = ({ children, ...props }) => {
    return (
        <RoleBasedComponent
            requiredRole="schoolAdmin"
            {...props}
        >
            {children}
        </RoleBasedComponent>
    );
};

/**
 * CompanyAdminComponent - Specialized wrapper for companyAdmin components
 */
export const CompanyAdminComponent = ({ children, ...props }) => {
    return (
        <RoleBasedComponent
            requiredRole="companyAdmin"
            {...props}
        >
            {children}
        </RoleBasedComponent>
    );
};

/**
 * StudentComponent - Specialized wrapper for student components
 * Automatically handles schoolId validation
 */
export const StudentComponent = ({ children, ...props }) => {
    return (
        <RoleBasedComponent
            requiredRole="student"
            {...props}
        >
            {children}
        </RoleBasedComponent>
    );
};

/**
 * LecturerComponent - Specialized wrapper for lecturer components
 */
export const LecturerComponent = ({ children, ...props }) => {
    return (
        <RoleBasedComponent
            requiredRole="lecturer"
            {...props}
        >
            {children}
        </RoleBasedComponent>
    );
};

export default RoleBasedComponent; 