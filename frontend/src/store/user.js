import { create } from "zustand";

export const useUserStore = create((set) => ({
  users: [],
  loading: {
    users: false,
  },
  error: {
    users: null,
  },

  createUser: async (user) => {
    set((state) => ({
      loading: { ...state.loading, users: true },
      error: { ...state.error, users: null },
    }));
    try {
      const res = await fetch(`/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create user");
      }

      set((state) => ({
        loading: { ...state.loading, users: false },
        error: { ...state.error, users: null },
        users: [...state.users, data.data],
      }));

      return { success: true, message: data.message, data: data.data };
    } catch (error) {
      set((state) => ({
        loading: { ...state.loading, users: false },
        error: { ...state.error, users: error.message },
      }));
      console.error("Error creating user", error.message);
      return { success: false, message: error.message };
    }
  },

  createUserWithoutJWT: async (user) => {
    set((state) => ({
      loading: { ...state.loading, users: true },
      error: { ...state.error, users: null },
    }));
    try {
      const res = await fetch(`/api/user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create user");
      }

      set((state) => ({
        loading: { ...state.loading, users: false },
        error: { ...state.error, users: null },
        users: [...state.users, data.data],
      }));

      return { success: true, message: data.message, data: data.data };
    } catch (error) {
      set((state) => ({
        loading: { ...state.loading, users: false },
        error: { ...state.error, users: error.message },
      }));
      console.error("Error creating user", error.message);
      return { success: false, message: error.message };
    }
  },

  createOAuthUser: async (oauthData) => {
    set((state) => ({
      loading: { ...state.loading, users: true },
      error: { ...state.error, users: null },
    }));
    try {
      const res = await fetch(`/api/user/oauth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(oauthData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create OAuth user");
      }

      set((state) => ({
        loading: { ...state.loading, users: false },
        error: { ...state.error, users: null },
        users: [...state.users, data.data],
      }));

      return { success: true, message: data.message, data: data.data };
    } catch (error) {
      set((state) => ({
        loading: { ...state.loading, users: false },
        error: { ...state.error, users: error.message },
      }));
      console.error("Error creating OAuth user", error.message);
      return { success: false, message: error.message };
    }
  },

  getUser: async (id) => {
    set((state) => ({
      loading: { ...state.loading, users: true },
      error: { ...state.error, users: null },
    }));
    try {
      const res = await fetch(`/api/user/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch user");
      }

      set((state) => ({
        loading: { ...state.loading, users: false },
        error: { ...state.error, users: null },
      }));

      return { success: true, data: data.data };
    } catch (error) {
      set((state) => ({
        loading: { ...state.loading, users: false },
        error: { ...state.error, users: error.message },
      }));
      console.error("Error fetching user:", error.message);
      return { success: false, message: error.message };
    }
  },

  getAllUsers: async (token) => {
    set((state) => ({
      loading: { ...state.loading, users: true },
      error: { ...state.error, users: null },
    }));
    try {
      const res = await fetch(`/api/user`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch all users");
      }

      set((state) => ({
        users: data.data,
        loading: { ...state.loading, users: false },
        error: { ...state.error, users: null },
      }));

      return { success: true, data: data.data };
    } catch (error) {
      set((state) => ({
        loading: { ...state.loading, users: false },
        error: { ...state.error, users: error.message },
      }));
      console.error("Error fetching all users:", error.message);
      return { success: false, message: error.message };
    }
  },

  fetchUserDataBySchoolId: async () => {
    set((state) => ({
      loading: { ...state.loading, users: true },
      error: { ...state.error, users: null },
    }));
    try {
      const authStore = useAuthStore.getState();
      const schoolId = authStore.getSchoolId();
      if (!schoolId) {
        throw new Error("School ID not found");
      }

      const res = await fetch(`/api/user/school/${schoolId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch users by school");
      }

      set((state) => ({
        users: data.data,
        loading: { ...state.loading, users: false },
        error: { ...state.error, users: null },
      }));

      return { success: true, message: data.message, data: data.data };
    } catch (error) {
      set((state) => ({
        loading: { ...state.loading, users: false },
        error: { ...state.error, users: error.message },
      }));
      console.error("Error fetching users:", error.message);
      return { success: false, message: error.message };
    }
  },

  checkUser: async (userDetails) => {
    // Optional: loading state can be added here too if needed
    try {
      const res = await fetch(`/api/user/check-user`, {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(userDetails),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to check user");
      }

      return {
        success: true,
        message: data.message,
        exist: data.exist,
        takenFields: data.takenFields,
      };
    } catch (error) {
      console.error("Error checking user:", error.message);
      return { success: false, message: error.message };
    }
  },

  modifyUser: async (id, userDetails) => {
    set((state) => ({
      loading: { ...state.loading, users: true },
      error: { ...state.error, users: null },
    }));
    try {
      const res = await fetch(`/api/user/${id}`, {
        method: "PUT",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(userDetails),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to modify user");
      }

      set((state) => ({
        loading: { ...state.loading, users: false },
        error: { ...state.error, users: null },
        users: state.users.map(u => u._id === id ? data.data : u),
      }));

      return { success: true, message: data.message, data: data.data };
    } catch (error) {
      set((state) => ({
        loading: { ...state.loading, users: false },
        error: { ...state.error, users: error.message },
      }));
      console.error("Error modifying user:", error.message);
      return { success: false, message: error.message };
    }
  },

  deleteUser: async (id) => {
    set((state) => ({
      loading: { ...state.loading, users: true },
      error: { ...state.error, users: null },
    }));
    try {
      const res = await fetch(`/api/user/${id}`, {
        method: "DELETE",
        headers: { "Content-type": "application/json" },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete user");
      }

      set((state) => ({
        loading: { ...state.loading, users: false },
        error: { ...state.error, users: null },
        users: state.users.filter(u => u._id !== id),
      }));

      return { success: true, message: data.message };
    } catch (error) {
      set((state) => ({
        loading: { ...state.loading, users: false },
        error: { ...state.error, users: error.message },
      }));
      console.error("Error deleting user:", error.message);
      return { success: false, message: error.message };
    }
  },

  updateUser: async (id, updateData) => {
    set((state) => ({
      loading: { ...state.loading, users: true },
      error: { ...state.error, users: null },
    }));
    try {
      const res = await fetch(`/api/user/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update user");
      }

      set((state) => ({
        loading: { ...state.loading, users: false },
        error: { ...state.error, users: null },
        users: state.users.map((user) =>
          user._id === id ? { ...user, ...data.data } : user
        ),
      }));

      return { success: true, message: data.message, data: data.data };
    } catch (error) {
      set((state) => ({
        loading: { ...state.loading, users: false },
        error: { ...state.error, users: error.message },
      }));
      console.error("Error updating user", error.message);
      return { success: false, message: error.message };
    }
  },

  updateUserProfilePicture: async (id, profilePicture) => {
    return await useUserStore.getState().updateUser(id, { profilePicture });
  },
}));
