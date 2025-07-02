import { create } from "zustand";

export const useUserStore = create((set) => ({
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
  getAllUsers: async (token) => {
    try {
      const res = await fetch(`/api/user`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch all user");
      }

      return { success: true, message: data.message, data: data.data };
    } catch (error) {
      console.error("Error fetching user:", error.message);
      return { success: false, message: error.message };
    }
  },
  checkUser: async (userDetails) => {
    try {
      const res = await fetch(`/api/user/check-user`, {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(userDetails),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch check user details");
      }

      return {
        success: true,
        message: data.message,
        exist: data.exist,
        takenFields: data.takenFields,
      };
    } catch (error) {
      console.error("Error fetching user:", error.message);
      return { success: false, message: error.message };
    }
  },
  modifyUser: async (id, userDetails) => {
    try {
      const res = await fetch(`/api/user/${id}`, {
        method: "PUT",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(userDetails),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to modify user");
      }

      return { success: true, message: data.message, data: data.data };
    } catch (error) {
      console.error("Error modifying user:", error.message);
      return { success: false, message: error.message };
    }
  },
  deleteUser: async (id) => {
    try {
      const res = await fetch(`/api/user/${id}`, {
        method: "DELETE",
        headers: {
          "Content-type": "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete user");
      }

      return { success: true, message: data.message };
    } catch (error) {
      console.error("Error deleting user:", error.message);
      return { success: false, message: error.message };
    }
  },
}));
