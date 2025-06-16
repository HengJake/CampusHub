import { create } from "zustand";

export const useUserStore = create((set) => ({
  users: [],
  setUser: (users) => set({ users }),
  loginUser: async (userDetails, role) => {
    try {
      const res = await fetch("/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userDetails),
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

      return { success: true, data: data.data };
    } catch (error) {
      console.error("Login error:", error.message);
      return { success: false, message: error.message };
    }
  },
  signupUser: async (userDetails) => {
    try {
      const res = await fetch("/api/user", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(userDetails),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Sign Up failed");
      }

      set({ users: [data.data] });

      return { success: true, data: data.data };
    } catch (error) {
      console.error("Login error:", error.message);
      return { success: false, message: error.message };
    }
  },
  getUser: async (id) => {
    try {
      const res = await fetch(`/api/user/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch user");
      }

      return { success: true, data: data.data };
    } catch (error) {
      console.error("Error fetching user:", error.message);
      return { success: false, message: error.message };
    }
  },
}));
