import { create } from "zustand";
import { useAuthStore } from "./auth.js";

export const useServiceStore = create((set, get) => ({
    // State - Store data for each entity
    feedback: [],
    foundItems: [],
    lostItems: [],
    responds: [],

    // Loading states
    loading: {
        feedback: false,
        foundItems: false,
        lostItems: false,
        responds: false,
    },

    // Error states
    errors: {
        feedback: null,
        foundItems: null,
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

    // Helper to wait for authentication
    waitForAuth: async () => {
        const authStore = useAuthStore.getState();
        let attempts = 0;
        const maxAttempts = 100;
        while (!authStore.isAuthenticated && attempts < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, 100));
            attempts++;
            const currentAuthStore = useAuthStore.getState();
            if (currentAuthStore.isAuthenticated) {
                break;
            }
        }
        if (!authStore.isAuthenticated) {
            throw new Error("Authentication timeout - please log in again");
        }
        const schoolId = authStore.getSchoolId();
        if (!schoolId && (authStore.getCurrentUser().role === "schoolAdmin" || authStore.getCurrentUser().role === "student")) {
            throw new Error("School ID not available - authentication incomplete");
        }
        return schoolId;
    },

    // ===== FEEDBACK OPERATIONS =====
    fetchFeedback: async (filters = {}) => {
        set((state) => ({ loading: { ...state.loading, feedback: true } }));
        try {
            await get().waitForAuth();
            const url = get().buildUrl("/api/feedback", filters);
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
            console.log("createFeedback called with:", feedbackData);
            const authStore = useAuthStore.getState();
            const userContext = authStore.getCurrentUser();
            console.log("User context:", userContext);
            if (userContext.role === "schoolAdmin" || userContext.role === "student") {
                const schoolId = authStore.getSchoolId();
                console.log("School ID:", schoolId);
                if (schoolId) {
                    feedbackData.schoolId = schoolId;
                }
            }
            console.log("Final feedback data to send:", feedbackData);
            const res = await fetch("/api/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: 'include',
                body: JSON.stringify(feedbackData),
            });
            const data = await res.json();
            console.log("Backend response:", data);
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

    // ===== FOUND ITEM OPERATIONS =====
    fetchFoundItems: async (filters = {}) => {
        set((state) => ({ loading: { ...state.loading, foundItems: true } }));
        try {
            await get().waitForAuth();
            const url = get().buildUrl("/api/found-item", filters);
            const res = await fetch(url, {
                credentials: 'include'
            });
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.message || "Failed to fetch found items");
            }
            set((state) => ({
                foundItems: data.data,
                loading: { ...state.loading, foundItems: false },
                errors: { ...state.errors, foundItems: null },
            }));
            return { success: true, data: data.data };
        } catch (error) {
            set((state) => ({
                loading: { ...state.loading, foundItems: false },
                errors: { ...state.errors, foundItems: error.message },
            }));
            return { success: false, message: error.message };
        }
    },
    createFoundItem: async (itemData) => {
        try {
            const authStore = useAuthStore.getState();
            const userContext = authStore.getCurrentUser();
            if (userContext.role === "schoolAdmin" || userContext.role === "student") {
                const schoolId = authStore.getSchoolId();
                if (schoolId) {
                    itemData.schoolId = schoolId;
                }
            }
            const res = await fetch("/api/found-item", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: 'include',
                body: JSON.stringify(itemData),
            });
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.message || "Failed to create found item");
            }
            set((state) => ({ foundItems: [...state.foundItems, data.data] }));
            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    updateFoundItem: async (id, updates) => {
        try {
            const res = await fetch(`/api/found-item/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: 'include',
                body: JSON.stringify(updates),
            });
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.message || "Failed to update found item");
            }
            set((state) => ({
                foundItems: state.foundItems.map((item) =>
                    item._id === id ? data.data : item
                ),
            }));
            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    deleteFoundItem: async (id) => {
        try {
            const res = await fetch(`/api/found-item/${id}`, {
                method: "DELETE",
                credentials: 'include',
            });
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.message || "Failed to delete found item");
            }
            set((state) => ({
                foundItems: state.foundItems.filter((item) => item._id !== id),
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
            await get().waitForAuth();
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
            await get().waitForAuth();
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
                foundItems: null,
                lostItems: null,
                responds: null,
            },
        }));
    },
    clearData: () => {
        set({
            feedback: [],
            foundItems: [],
            lostItems: [],
            responds: [],
        });
    },
}));
