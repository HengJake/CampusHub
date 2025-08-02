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

      return { success: true, data: enhancedUser };
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
        });
        const schoolData = await schoolRes.json();
        if (schoolData.success && schoolData.schoolId) {
          enhancedUser.schoolId = schoolData.schoolId;
          set({ schoolId: schoolData.schoolId });
        }
      } else if (user.role === "student") {
        // Fetch student data including schoolId
        const studentRes = await fetch("/auth/is-auth", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const studentData = await studentRes.json();

        if (studentData.success) {
          enhancedUser.schoolId = studentData.schoolId;
          enhancedUser.student = studentData.student;
          set({
            schoolId: studentData.schoolId,
            studentId: studentData.student?._id
          });
        }
      }

      return enhancedUser;
    } catch (error) {
      console.error("Error fetching role-specific data:", error);
      return user; // Return original user if enhancement fails
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
      role: state.currentUser?.role || state.user?.role
    };
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
        studentId: enhancedUser.studentId
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
}));
