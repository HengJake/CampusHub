import { create } from "zustand";

export const userUserStore = create((set) => ({
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
}));
