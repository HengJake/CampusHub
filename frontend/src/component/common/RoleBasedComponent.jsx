import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Box, Spinner, Alert, AlertIcon, AlertTitle, AlertDescription } from '@chakra-ui/react';
import { EHailingNotification } from './EHailingNotification.jsx';

/**
 * RoleBasedComponent - A wrapper component that provides role-based context
 * and automatically handles authentication based on JWT tokens
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
    incompleteSetupComponent,
    onAuthSuccess,
    onAuthError,
    skipAuth = false,
    ...props
}) => {
    const {
        isAuthenticated,
        isInitialized,
        isLoading,
        userRole,
        hasAccess,
        isSchoolSetupComplete
    } = useAuth();

    const [authError, setAuthError] = useState(null);
    const [authSuccess, setAuthSuccess] = useState(false);

    useEffect(() => {
        if (isInitialized && !isLoading && !authSuccess) {
            if (isAuthenticated && hasAccess(requiredRole)) {
                // Authentication successful - no need to validate schoolId
                setAuthSuccess(true);
                setAuthError(null);
                onAuthSuccess?.({ role: userRole });
            } else {
                setAuthError('Access denied. Insufficient permissions.');
                onAuthError?.({ message: 'Access denied' });
            }
        }
    }, [isInitialized, isLoading, isAuthenticated, userRole, requiredRole, hasAccess, onAuthSuccess, onAuthError]);

    // Show loading state
    if (!isInitialized || isLoading) {
        if (showLoading) {
            return loadingComponent || (
                <Box flex={1}>
                    <Spinner size="lg" color="blue.500" pos={"fixed"} top={"50%"} left={"50%"} transform={"transform(-50%,-50%)"} />
                </Box>
            );
        }
        return null;
    }

    // Check for incomplete school setup
    if (requiredRole === "schoolAdmin" && isAuthenticated && hasAccess(requiredRole)) {
        if (!isSchoolSetupComplete) {
            if (incompleteSetupComponent) {
                return incompleteSetupComponent;
            }
            // Redirect to school setup page
            window.location.href = '/school-setup';
            return null;
        }
    }

    // Show unauthorized state
    if (!isAuthenticated || !hasAccess(requiredRole) || authError) {
        if (unauthorizedComponent) {
            return unauthorizedComponent;
        }

        // Redirect to landing page after showing alert
        setTimeout(() => {
            window.location.href = '/';
        }, 2500);

        return (
            <Alert status="error" variant="subtle" flexDirection="column" alignItems="center" justifyContent="center" textAlign="center" height="100%" pos={"fixed"} zIndex={-1} top={0} left={0}>
                <AlertIcon boxSize="40px" mr={0} />
                <AlertTitle mt={4} mb={1} fontSize="lg">
                    Access Denied
                </AlertTitle>
                <AlertDescription maxWidth="sm">
                    {'You do not have permission to access this resource. Redirecting to home page...'}
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
 * Handles authentication and role validation
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
 * Handles authentication and role validation
 */
export const StudentComponent = ({ children, ...props }) => {
    return (
        <RoleBasedComponent
            requiredRole="student"
            {...props}
        >
            {children}
            <EHailingNotification />
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