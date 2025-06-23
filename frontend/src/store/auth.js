import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: null,
  loggedIn: (user) => set({ user }),
  loggedOut: () => set({ user: null }),
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

      loggedIn(data.data);

      return { success: true, message: data.message, data: data.data };
    } catch (error) {
      console.error("Login error:", error.message);
      return { success: false, message: error.message };
    }
  },
}));
