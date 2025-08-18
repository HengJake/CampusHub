import { create } from "zustand";
import { useAuthStore } from "./auth.js";

export const useServiceStore = create((set, get) => ({
    // State - Store data for each entity
    feedback: [],
    lostItems: [],
    responds: [],

    // Loading states
    loading: {
        feedback: false,
        lostItems: false,
        responds: false,
    },

    // Error states
    errors: {
        feedback: null,
        lostItems: null,
        responds: null,
    },

    // Helper to get schoolId from auth store
    getSchoolId: () => {
        const authStore = useAuthStore.getState();
        return authStore.getSchoolId();
    },

    // Helper to get current user context
    getCurrentUser: () => {
        const authStore = useAuthStore.getState();
        return authStore.getCurrentUser();
    },

    // Helper to check authentication
    isAuthenticated: () => {
        const authStore = useAuthStore.getState();
        return authStore.isAuthenticated;
    },

    // Helper to build URL with automatic schoolId injection
    buildUrl: (endpoint, filters = {}) => {
        const authStore = useAuthStore.getState();
        const userContext = authStore.getCurrentUser();
        let url = endpoint;
        if (userContext.role === "schoolAdmin" || userContext.role === "student") {
            const schoolId = authStore.getSchoolId();
            if (schoolId) {
                if (endpoint.includes("/school/")) {
                    url = endpoint;
                } else {
                    url = `${endpoint}/school/${schoolId}`;
                }
            }
        }
        const queryParams = new URLSearchParams(filters);
        if (queryParams.toString()) {
            url += `?${queryParams.toString()}`;
        }
        return url;
    },

    // ===== FEEDBACK OPERATIONS =====
    fetchFeedback: async (filters = {}) => {
        set((state) => ({ loading: { ...state.loading, feedback: true } }));
        try {
            let url;
            const authStore = useAuthStore.getState();
            const userContext = authStore.getState().getCurrentUser();

            if (userContext.role === "schoolAdmin" || userContext.role === "student") {
                const schoolId = authStore.getSchoolId();
                if (schoolId) {
                    if (filters.studentId) {
                        // URL format: /api/feedback/school/{schoolId}/student/{studentId}
                        url = `/api/feedback/school/${schoolId}/student/${filters.studentId}`;
                    } else {
                        // Default URL format: /api/feedback/school/{schoolId}
                        url = `/api/feedback/school/${schoolId}`;
                    }
                } else {
                    url = "/api/feedback";
                }
            } else {
                url = "/api/feedback";
            }

            const res = await fetch(url, {
                credentials: 'include'
            });
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.message || "Failed to fetch feedback");
            }
            set((state) => ({
                feedback: data.data,
                loading: { ...state.loading, feedback: false },
                errors: { ...state.errors, feedback: null },
            }));
            return { success: true, data: data.data };
        } catch (error) {
            set((state) => ({
                loading: { ...state.loading, feedback: false },
                errors: { ...state.errors, feedback: error.message },
            }));
            return { success: false, message: error.message };
        }
    },

    fetchFeedbackBySchoolId: async (filters = {}) => {
        set((state) => ({ loading: { ...state.loading, feedback: true } }));
        try {
            const authStore = useAuthStore.getState();
            const schoolId = authStore.getSchoolId();
            if (!schoolId) {
                throw new Error("School ID not found");
            }

            let url = `/api/feedback/school/${schoolId}`;
            if (filters.studentId) {
                url = `/api/feedback/school/${schoolId}/student/${filters.studentId}`;
            }

            const res = await fetch(url, {
                credentials: 'include'
            });
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.message || "Failed to fetch feedback");
            }
            set((state) => ({
                feedback: data.data,
                loading: { ...state.loading, feedback: false },
                errors: { ...state.errors, feedback: null },
            }));
            return { success: true, data: data.data };
        } catch (error) {
            set((state) => ({
                loading: { ...state.loading, feedback: false },
                errors: { ...state.errors, feedback: error.message },
            }));
            return { success: false, message: error.message };
        }
    },
    createFeedback: async (feedbackData) => {
        try {
            const authStore = useAuthStore.getState();
            const userContext = authStore.getCurrentUser();
            if (userContext.role === "schoolAdmin" || userContext.role === "student") {
                const schoolId = authStore.getSchoolId();
                if (schoolId) {
                    feedbackData.schoolId = schoolId;
                }
            }
            const res = await fetch("/api/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: 'include',
                body: JSON.stringify(feedbackData),
            });
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.message || "Failed to create feedback");
            }
            set((state) => ({ feedback: [...state.feedback, data.data] }));
            return { success: true, data: data.data };
        } catch (error) {
            console.error("Error in createFeedback:", error);
            return { success: false, message: error.message };
        }
    },
    updateFeedback: async (id, updates) => {
        try {
            const res = await fetch(`/api/feedback/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: 'include',
                body: JSON.stringify(updates),
            });
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.message || "Failed to update feedback");
            }
            set((state) => ({
                feedback: state.feedback.map((item) =>
                    item._id === id ? data.data : item
                ),
            }));
            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    deleteFeedback: async (id) => {
        try {
            const res = await fetch(`/api/feedback/${id}`, {
                method: "DELETE",
                credentials: 'include',
            });
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.message || "Failed to delete feedback");
            }
            set((state) => ({
                feedback: state.feedback.filter((item) => item._id !== id),
            }));
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    // ===== LOST ITEM OPERATIONS =====
    fetchLostItems: async (filters = {}) => {
        set((state) => ({ loading: { ...state.loading, lostItems: true } }));
        try {
            const url = get().buildUrl("/api/lost-item", filters);
            const res = await fetch(url, {
                credentials: 'include'
            });
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.message || "Failed to fetch lost items");
            }
            set((state) => ({
                lostItems: data.data,
                loading: { ...state.loading, lostItems: false },
                errors: { ...state.errors, lostItems: null },
            }));
            return { success: true, data: data.data };
        } catch (error) {
            set((state) => ({
                loading: { ...state.loading, lostItems: false },
                errors: { ...state.errors, lostItems: error.message },
            }));
            return { success: false, message: error.message };
        }
    },

    fetchLostItemsBySchoolId: async (filters = {}) => {
        set((state) => ({ loading: { ...state.loading, lostItems: true } }));
        try {
            const authStore = useAuthStore.getState();
            const schoolId = authStore.getSchoolId();
            if (!schoolId) {
                throw new Error("School ID not found");
            }

            const url = get().buildUrl(`/api/lost-item/school/${schoolId}`, filters);
            const res = await fetch(url, {
                credentials: 'include'
            });
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.message || "Failed to fetch lost items");
            }
            set((state) => ({
                lostItems: data.data,
                loading: { ...state.loading, lostItems: false },
                errors: { ...state.errors, lostItems: null },
            }));
            return { success: true, data: data.data };
        } catch (error) {
            set((state) => ({
                loading: { ...state.loading, lostItems: false },
                errors: { ...state.errors, lostItems: error.message },
            }));
            return { success: false, message: error.message };
        }
    },
    createLostItem: async (itemData) => {
        try {
            const authStore = useAuthStore.getState();
            const userContext = authStore.getCurrentUser();
            if (userContext.role === "schoolAdmin" || userContext.role === "student") {
                const schoolId = authStore.getSchoolId();
                if (schoolId) {
                    itemData.schoolId = schoolId;
                }
            }
            const res = await fetch("/api/lost-item", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: 'include',
                body: JSON.stringify(itemData),
            });
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.message || "Failed to create lost item");
            }
            set((state) => ({ lostItems: [...state.lostItems, data.data] }));
            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    updateLostItem: async (id, updates) => {
        try {
            const res = await fetch(`/api/lost-item/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: 'include',
                body: JSON.stringify(updates),
            });
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.message || "Failed to update lost item");
            }
            set((state) => ({
                lostItems: state.lostItems.map((item) =>
                    item._id === id ? data.data : item
                ),
            }));
            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    deleteLostItem: async (id) => {
        try {
            const res = await fetch(`/api/lost-item/${id}`, {
                method: "DELETE",
                credentials: 'include',
            });
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.message || "Failed to delete lost item");
            }
            set((state) => ({
                lostItems: state.lostItems.filter((item) => item._id !== id),
            }));
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    // ===== RESPOND OPERATIONS =====
    fetchResponds: async (filters = {}) => {
        set((state) => ({ loading: { ...state.loading, responds: true } }));
        try {
            const url = get().buildUrl("/api/respond", filters);
            const res = await fetch(url, {
                credentials: 'include'
            });
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.message || "Failed to fetch responds");
            }
            set((state) => ({
                responds: data.data,
                loading: { ...state.loading, responds: false },
                errors: { ...state.errors, responds: null },
            }));
            return { success: true, data: data.data };
        } catch (error) {
            set((state) => ({
                loading: { ...state.loading, responds: false },
                errors: { ...state.errors, responds: error.message },
            }));
            return { success: false, message: error.message };
        }
    },

    fetchRespondsBySchoolId: async (filters = {}) => {
        set((state) => ({ loading: { ...state.loading, responds: true } }));
        try {
            const authStore = useAuthStore.getState();
            const schoolId = authStore.getSchoolId();
            if (!schoolId) {
                throw new Error("School ID not found");
            }

            const url = get().buildUrl(`/api/respond/school/${schoolId}`, filters);
            const res = await fetch(url, {
                credentials: 'include'
            });
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.message || "Failed to fetch responds");
            }
            set((state) => ({
                responds: data.data,
                loading: { ...state.loading, responds: false },
                errors: { ...state.errors, responds: null },
            }));
            return { success: true, data: data.data };
        } catch (error) {
            set((state) => ({
                loading: { ...state.loading, responds: false },
                errors: { ...state.errors, responds: error.message },
            }));
            return { success: false, message: error.message };
        }
    },
    createRespond: async (respondData) => {
        try {
            const authStore = useAuthStore.getState();
            const userContext = authStore.getCurrentUser();
            if (userContext.role === "schoolAdmin" || userContext.role === "student") {
                const schoolId = authStore.getSchoolId();
                if (schoolId) {
                    respondData.schoolId = schoolId;
                }
            }
            const res = await fetch("/api/respond", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: 'include',
                body: JSON.stringify(respondData),
            });
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.message || "Failed to create respond");
            }
            set((state) => ({ responds: [...state.responds, data.data] }));
            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    updateRespond: async (id, updates) => {
        try {
            const res = await fetch(`/api/respond/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: 'include',
                body: JSON.stringify(updates),
            });
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.message || "Failed to update respond");
            }
            set((state) => ({
                responds: state.responds.map((item) =>
                    item._id === id ? data.data : item
                ),
            }));
            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    deleteRespond: async (id) => {
        try {
            const res = await fetch(`/api/respond/${id}`, {
                method: "DELETE",
                credentials: 'include',
            });
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.message || "Failed to delete respond");
            }
            set((state) => ({
                responds: state.responds.filter((item) => item._id !== id),
            }));
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    // ===== UTILITY FUNCTIONS =====
    clearErrors: () => {
        set({ errors: {} });
    },
    clearAllErrors: () => {
        set((state) => ({
            errors: {
                feedback: null,
                lostItems: null,
                responds: null,
            },
        }));
    },
    clearData: () => {
        set({
            feedback: [],
            lostItems: [],
            responds: [],
        });
    },
}));
