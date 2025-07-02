import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: null,
  logIn: async (loginCredential, role) => {
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

      if (!(data.data.role === role)) {
        return { success: false, message: "Please use the right interface" };
      }

      // Set the logged in user (you can change to `set({ currentUser: data.user })`)
      set({ users: [data.data] });
    } catch (error) {
      console.error("Login error:", error.message);
      return { success: false, message: error.message };
    }
  },
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

      return { success: true, message: data.message };
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

      return {
        success: true,
        message: data.message,
        id: data.id,
        twoFA_enabled: data.twoFA_enabled,
      };
    } catch (error) {
      console.error("Authorization error:", error.message);
      return { success: false, message: error.message };
    }
  },
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

      set({ user: null });
      return { success: true, message: data.message };
    } catch (error) {
      console.error("Logout error:", error.message);
      return { success: false, message: error.message };
    }
  },
}));
