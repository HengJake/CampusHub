import { create } from "zustand";

export const useAuthStore = create((set, get) => ({
  user: null,
  currentUser: null, // Enhanced user object with role-specific data
  schoolId: null, // For schoolAdmin users
  studentId: null, // For student users
  isAuthenticated: false,
  isLoading: false,

  // Enhanced login with automatic role-based data fetching
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

      // Set basic user data
      set({
        user: data.data,
        isAuthenticated: true,
        isLoading: false
      });

      // Fetch role-specific data based on user role
      const enhancedUser = await get().fetchRoleSpecificData(data.data);
      set({ currentUser: enhancedUser });

      return {
        success: true,
        data: enhancedUser,
        token: data.token || null,
        schoolSetupComplete: enhancedUser.schoolSetupComplete
      };
    } catch (error) {
      set({ isLoading: false });
      console.error("Login error:", error.message);
      return { success: false, message: error.message };
    }
  },

  // Fetch role-specific data (schoolId, studentId, etc.)
  fetchRoleSpecificData: async (user) => {
    try {
      let enhancedUser = { ...user };

      if (user.role === "schoolAdmin") {
        // Fetch school data for schoolAdmin
        const schoolRes = await fetch("/auth/is-auth", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: 'include', // Include cookies
        });
        const schoolData = await schoolRes.json();
        if (schoolData.success && schoolData.schoolId) {
          enhancedUser.schoolId = schoolData.schoolId;
          enhancedUser.schoolSetupComplete = true;
          set({ schoolId: schoolData.schoolId });
        } else {
          enhancedUser.schoolSetupComplete = false;
        }
      } else if (user.role === "student") {
        // Fetch student data including schoolId
        const studentRes = await fetch("/auth/is-auth", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: 'include', // Include cookies
        });
        const studentData = await studentRes.json();

        if (studentData.success) {
          enhancedUser.schoolId = studentData.schoolId;
          enhancedUser.studentId = studentData.student._id;
          enhancedUser.schoolSetupComplete = true;
          set({
            schoolId: studentData.schoolId,
            studentId: studentData.student._id
          });
        } else {
          enhancedUser.schoolSetupComplete = false;
        }
      } else {
        // For other roles, assume setup is complete
        enhancedUser.schoolSetupComplete = true;
      }

      return enhancedUser;
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

  // Role-based data fetching helpers
  fetchSchoolData: async () => {
    const schoolId = get().getSchoolId();
    if (!schoolId) {
      throw new Error("No schoolId available for current user");
    }
    return schoolId;
  },

  // Enhanced authorize user with role-specific data
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

      // Fetch role-specific data
      const enhancedUser = await get().fetchRoleSpecificData(data);

      set({
        currentUser: enhancedUser,
        isAuthenticated: true,
        schoolId: enhancedUser.schoolId,
        studentId: enhancedUser.studentId,
      });

      return {
        success: true,
        message: data.message,
        data: enhancedUser,
        role: data.role,
        schoolId: enhancedUser.schoolId,
        studentId: enhancedUser.studentId,
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

      if (data.success) {
        // User is authenticated, restore the state
        const enhancedUser = await get().fetchRoleSpecificData(data);

        set({
          user: data,
          currentUser: enhancedUser,
          isAuthenticated: true,
          schoolId: enhancedUser.schoolId,
          studentId: enhancedUser.studentId,
        });

        return {
          success: true,
          message: "Authentication restored from cookies",
          data: enhancedUser,
          schoolId: enhancedUser.schoolId,
          studentId: enhancedUser.studentId,
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
}));
