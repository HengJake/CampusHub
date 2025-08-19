import { create } from "zustand";

export const useAuthStore = create((set, get) => ({
  user: null,
  currentUser: null, // Enhanced user object with role-specific data from JWT token
  schoolId: null, // For schoolAdmin users
  studentId: null, // For student users
  lecturerId: null, // For lecturer users
  student: null, // Store complete student object
  lecturer: null, // Store complete lecturer object
  school: null, // Store complete school object
  isAuthenticated: false,
  isLoading: false,

  // Enhanced login with role-specific data from JWT token
  logIn: async (loginCredential) => {
    set({ isLoading: true });
    try {
      const res = await fetch("/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginCredential),
        credentials: 'include', // Include cookies
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Login failed");
      }

      // Get role-specific data from JWT token via isAuthenticated endpoint
      const authRes = await fetch("/auth/is-auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
      });

      const authData = await authRes.json();

      if (authData.success) {
        // Extract role-specific data from the authenticated response
        const enhancedUser = {
          ...data.data,
          schoolId: authData.schoolId || null,
          studentId: authData.studentId || null,
          lecturerId: authData.lecturerId || null,
          student: authData.student || null,
          lecturer: authData.lecturer || null,
          school: authData.school || null,
          schoolSetupComplete: authData.schoolSetupComplete || false
        };

        set({
          user: data.data,
          currentUser: enhancedUser,
          isAuthenticated: true,
          schoolId: enhancedUser.schoolId,
          studentId: enhancedUser.studentId || enhancedUser.student?._id || null,
          lecturerId: enhancedUser.lecturerId || enhancedUser.lecturer?._id || null,
          student: enhancedUser.student,
          lecturer: enhancedUser.lecturer,
          school: enhancedUser.school,
          isLoading: false
        });

        return {
          success: true,
          data: enhancedUser,
          schoolSetupComplete: enhancedUser.schoolSetupComplete
        };
      } else {
        // Fallback: if role-specific data is not available, use basic user data
        const enhancedUser = {
          ...data.data,
          schoolId: null,
          studentId: null,
          lecturerId: null,
          student: null,
          lecturer: null,
          school: null,
          schoolSetupComplete: false
        };

        set({
          user: data.data,
          currentUser: enhancedUser,
          isAuthenticated: true,
          schoolId: null,
          studentId: null,
          lecturerId: null,
          student: null,
          lecturer: null,
          school: null,
          isLoading: false
        });

        return {
          success: true,
          data: enhancedUser,
          schoolSetupComplete: false
        };
      }
    } catch (error) {
      set({ isLoading: false });
      console.error("Login error:", error.message);
      return { success: false, message: error.message };
    }
  },

  // OAuth login method
  logInWithOAuth: async (oauthData) => {
    set({ isLoading: true });
    try {
      // Authenticate the user via OAuth
      const authRes = await fetch("/auth/oauth-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: oauthData.email,
          googleId: oauthData.googleId,
          authProvider: oauthData.authProvider
        }),
        credentials: 'include',
      });

      const authData = await authRes.json();

      if (!authData.success) {
        throw new Error(authData.message || "OAuth authentication failed");
      }

      // Get role-specific data from JWT token via isAuthenticated endpoint
      const roleRes = await fetch("/auth/is-auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
      });

      const roleData = await roleRes.json();

      if (roleData.success) {
        // Extract role-specific data from the authenticated response
        const enhancedUser = {
          ...authData.data,
          schoolId: roleData.schoolId || null,
          studentId: roleData.studentId || null,
          lecturerId: roleData.lecturerId || null,
          student: roleData.student || null,
          lecturer: roleData.lecturer || null,
          school: roleData.school || null,
          schoolSetupComplete: roleData.schoolSetupComplete || false
        };

        set({
          user: authData.data,
          currentUser: enhancedUser,
          isAuthenticated: true,
          schoolId: enhancedUser.schoolId,
          studentId: enhancedUser.studentId || enhancedUser.student?._id || null,
          lecturerId: enhancedUser.lecturerId || enhancedUser.lecturer?._id || null,
          student: enhancedUser.student,
          lecturer: enhancedUser.lecturer,
          school: enhancedUser.school,
          isLoading: false
        });

        return {
          success: true,
          data: enhancedUser,
          schoolSetupComplete: enhancedUser.schoolSetupComplete
        };
      } else {
        // Fallback: if role-specific data is not available, use basic user data
        const enhancedUser = {
          ...authData.data,
          schoolId: null,
          studentId: null,
          lecturerId: null,
          student: null,
          lecturer: null,
          school: null,
          schoolSetupComplete: false
        };

        set({
          user: authData.data,
          currentUser: enhancedUser,
          isAuthenticated: true,
          schoolId: null,
          studentId: null,
          lecturerId: null,
          student: null,
          lecturer: null,
          school: null,
          isLoading: false
        });

        return {
          success: true,
          data: enhancedUser,
          schoolSetupComplete: false
        };
      }
    } catch (error) {
      set({ isLoading: false });
      console.error("OAuth login error:", error.message);
      return { success: false, message: error.message };
    }
  },

  // Fetch role-specific data from JWT token (fallback method)
  fetchRoleSpecificData: async (user) => {
    try {
      // Get role-specific data from JWT token via isAuthenticated endpoint
      const res = await fetch("/auth/is-auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
      });

      const data = await res.json();

      if (data.success) {
        const enhancedUser = {
          ...user,
          schoolId: data.schoolId || null,
          studentId: data.studentId || null,
          lecturerId: data.lecturerId || null,
          student: data.student || null,
          lecturer: data.lecturer || null,
          school: data.school || null,
          schoolSetupComplete: data.schoolSetupComplete || false
        };

        // Update store state
        set({
          schoolId: enhancedUser.schoolId,
          studentId: enhancedUser.studentId || enhancedUser.student?._id || null,
          lecturerId: enhancedUser.lecturerId || enhancedUser.lecturer?._id || null,
          student: enhancedUser.student,
          lecturer: enhancedUser.lecturer,
          school: enhancedUser.school
        });

        return enhancedUser;
      } else {
        throw new Error("Failed to get role-specific data");
      }
    } catch (error) {
      console.error("Error fetching role-specific data:", error);
      // Return user with default setup status
      return { ...user, schoolSetupComplete: false };
    }
  },

  // Get current user context with role-specific data
  getCurrentUser: () => {
    const state = get();
    return {
      user: state.currentUser || state.user,
      schoolId: state.schoolId,
      studentId: state.studentId,
      student: state.student,
      school: state.school,
      isAuthenticated: state.isAuthenticated,
      role: state.currentUser?.role || state.user?.role,
      schoolSetupComplete: state.currentUser?.schoolSetupComplete || false
    };
  },

  getCurrentUserWithAuth: async () => {
    const state = get();

    if (state.currentUser || state.user) {
      return get().getCurrentUser();
    }

    try {
      const authResult = await get().authorizeUser();
      if (authResult.success) {
        return {
          user: authResult.data,
          schoolId: authResult.schoolId,
          studentId: authResult.studentId,
          student: authResult.student,
          school: authResult.school,
          isAuthenticated: true,
          role: authResult.data.role,
          schoolSetupComplete: authResult.schoolSetupComplete
        };
      }
    } catch (error) {
      console.error("Failed to re-authenticate from cookies:", error);
    }

    return get().getCurrentUser();
  },

  // Get schoolId for schoolAdmin operations
  getSchoolId: () => {
    const state = get();
    if (state.currentUser?.role === "schoolAdmin" || state.currentUser?.role === "student") {
      return state.schoolId;
    }
    return null;
  },

  // Get complete student object
  getStudent: () => {
    const state = get();
    return state.student;
  },

  // Get complete school object
  getSchool: () => {
    const state = get();
    return state.school;
  },

  // Role-based data fetching helpers
  fetchSchoolData: async () => {
    const schoolId = get().getSchoolId();
    if (!schoolId) {
      throw new Error("No schoolId available for current user");
    }
    return schoolId;
  },

  // Enhanced authorize user with role-specific data from JWT token
  authorizeUser: async () => {
    try {
      const res = await fetch(`/auth/is-auth`, {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        credentials: 'include', // Include cookies
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Authorization failed");
      }

      // Create enhanced user with role-specific data from JWT token
      const enhancedUser = {
        ...data.user,
        schoolId: data.schoolId || null,
        student: data.student || null,
        lecturer: data.lecturer || null,
        school: data.school || null,
        schoolSetupComplete: data.schoolSetupComplete || false
      };

      set({
        currentUser: enhancedUser,
        isAuthenticated: true,
        schoolId: enhancedUser.schoolId,
        studentId: enhancedUser.student?._id || null,
        student: enhancedUser.student || null,
        school: enhancedUser.school || null,
      });

      return {
        success: true,
        message: data.message,
        data: {
          ...enhancedUser,
        },
        tokenExpiration: data.tokenExpiration,
        role: data.role,
        schoolId: enhancedUser.schoolId,
        studentId: enhancedUser.studentId,
        student: enhancedUser.student || null,
        school: enhancedUser.school || null,
        schoolSetupComplete: enhancedUser.schoolSetupComplete
      };
    } catch (error) {
      set({ isAuthenticated: false });
      console.error("Authorization error:", error.message);
      return { success: false, message: error.message };
    }
  },

  // Clear all auth data
  clearAuth: () => {
    set({
      user: null,
      currentUser: null,
      schoolId: null,
      studentId: null,
      student: null,
      school: null,
      isAuthenticated: false,
      isLoading: false
    });
  },

  // Enhanced logout
  logout: async () => {
    try {
      const res = await fetch("/auth/logout", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        credentials: 'include', // Include cookies
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Logout failed");
      }

      get().clearAuth();
      return { success: true, message: data.message };
    } catch (error) {
      console.error("Logout error:", error.message);
      return { success: false, message: error.message };
    }
  },

  // Legacy functions for backward compatibility
  signUp: async (signUpCredential) => {
    try {
      const res = await fetch("/auth/register", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(signUpCredential),
        credentials: 'include', // Include cookies
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Sign Up failed");
      }

      set({ user: [data.data] });

      return { success: true, message: data.message, data: data.data };
    } catch (error) {
      console.error("Login error:", error.message);
      return { success: false, message: error.message };
    }
  },

  // OAuth-specific registration method
  signUpWithOAuth: async (oauthUserData) => {
    try {
      // Format OAuth data for registration
      const registrationData = {
        email: oauthUserData.email,
        name: oauthUserData.name,
        role: oauthUserData.role || "schoolAdmin",
        authProvider: oauthUserData.authProvider || "google",
        googleId: oauthUserData.googleId,
        profilePicture: oauthUserData.profilePicture,
        phoneNumber: oauthUserData.phoneNumber || ""
      };

      // Use the dedicated OAuth signup endpoint
      const res = await fetch("/auth/register-oauth", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(registrationData),
        credentials: 'include', // Include cookies
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "OAuth registration failed");
      }

      // Update store with the new user data
      set({ user: [data.data] });

      return { success: true, message: data.message, data: data.data };
    } catch (error) {
      console.error("OAuth registration error:", error.message);
      return { success: false, message: error.message };
    }
  },

  sendVerifyOtp: async () => {
    try {
      const res = await fetch("/auth/send-verify-otp", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        credentials: 'include', // Include cookies
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Verification failed");
      }

      return { success: true, message: data.message, otp: data.otp };
    } catch (error) {
      console.error("Login error:", error.message);
      return { success: false, message: error.message };
    }
  },

  verifyAccount: async (otp) => {
    try {
      const res = await fetch("/auth/verify-account", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({ otp }),
        credentials: 'include', // Include cookies
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Verification failed");
      }

      return { success: true, message: data.message };
    } catch (error) {
      console.error("Login error:", error.message);
      return { success: false, message: error.message };
    }
  },

  // Initialize auth state from cookies on app startup
  initializeAuth: async () => {
    try {
      // Check if user is authenticated via cookies
      const res = await fetch("/auth/is-auth", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        credentials: 'include', // Include cookies
      });

      const data = await res.json();
      console.log("🚀 ~ data:", data)

      if (data.success) {
        // User is authenticated, create enhanced user with role-specific data
        const enhancedUser = {
          ...data.user,
          schoolId: data.schoolId || null,
          student: data.student || null,
          lecturer: data.lecturer || null,
          school: data.school || null,
          schoolSetupComplete: data.schoolSetupComplete || false
        };

        set({
          user: data.user,
          currentUser: enhancedUser,
          isAuthenticated: true,
          schoolId: enhancedUser.schoolId,
          studentId: enhancedUser.student?._id || null,
          student: enhancedUser.student || null,
          school: enhancedUser.school || null,
        });

        return {
          success: true,
          message: "Authentication restored from cookies",
          data: enhancedUser,
          schoolId: enhancedUser.schoolId,
          studentId: enhancedUser.studentId,
          student: enhancedUser.student || null,
          school: enhancedUser.school || null,
          schoolSetupComplete: enhancedUser.schoolSetupComplete
        };
      } else {
        // User is not authenticated, clear any stale state
        get().clearAuth();
        return { success: false, message: "No valid authentication found" };
      }
    } catch (error) {
      console.error("Auth initialization error:", error.message);
      // Clear any stale state on error
      get().clearAuth();
      return { success: false, message: error.message };
    }
  },

  unifiedAuth: async (oauthData) => {
    try {
      const response = await fetch('/auth/unified', { // Remove /api prefix
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ oauthData })
      });

      const result = await response.json();
      console.log('unifiedAuth response:', result);

      // If login is successful, update the store state
      if (result.success && result.data) {
        // Create enhanced user object
        const enhancedUser = {
          ...result.data,
          schoolId: result.data.schoolId || null,
          studentId: result.data.studentId || result.data.student?._id || null,
          student: result.data.student || null,
          lecturer: result.data.lecturer || null,
          school: result.data.school || null,
          schoolSetupComplete: result.data.schoolSetupComplete || false
        };

        // Update store state
        set({
          user: result.data,
          currentUser: enhancedUser,
          isAuthenticated: true,
          schoolId: enhancedUser.schoolId,
          studentId: enhancedUser.studentId,
          lecturerId: enhancedUser.lecturerId || enhancedUser.lecturer?._id || null,
          student: enhancedUser.student,
          lecturer: enhancedUser.lecturer,
          school: enhancedUser.school,
          isLoading: false
        });
      }

      return result;
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  },

  linkOAuthAccount: async (email, password, oauthData) => {
    try {
      const response = await fetch('/auth/link-oauth', { // Remove /api prefix
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, oauthData })
      });

      const result = await response.json();

      // If linking is successful, update the store state
      if (result.success && result.data) {
        // Create enhanced user object
        const enhancedUser = {
          ...result.data,
          schoolId: result.data.schoolId || null,
          studentId: result.data.studentId || result.data.student?._id || null,
          student: result.data.student || null,
          lecturer: result.data.lecturer || null,
          school: result.data.school || null,
          schoolSetupComplete: result.data.schoolSetupComplete || false
        };

        // Update store state
        set({
          user: result.data,
          currentUser: enhancedUser,
          isAuthenticated: true,
          schoolId: enhancedUser.schoolId,
          studentId: enhancedUser.studentId,
          lecturerId: enhancedUser.lecturerId || enhancedUser.lecturer?._id || null,
          student: enhancedUser.student,
          lecturer: enhancedUser.lecturer,
          school: enhancedUser.school,
          isLoading: false
        });
      }

      return result;
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  },
}));
