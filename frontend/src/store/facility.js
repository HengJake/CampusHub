import { create } from "zustand";
import { useAuthStore } from "./auth.js";

export const useFacilityStore = create((set, get) => ({
    // State - Store data for each entity
    facilities: [],
    bookings: [],
    resources: [],
    timeSlots: [],

    // Loading states
    loading: {
        facilities: false,
        bookings: false,
        resources: false,
        timeSlots: false,
    },

    // Error states
    errors: {
        facilities: null,
        bookings: null,
        resources: null,
        timeSlots: null,
    },

    // Helper to get schoolId from auth store (reference @auth.js)
    getSchoolId: () => {
        const authStore = useAuthStore.getState();
        return authStore.getSchoolId();
    },

    // Helper to get current user context (reference @auth.js)
    getCurrentUser: () => {
        const authStore = useAuthStore.getState();
        return authStore.getCurrentUser();
    },

    // Helper to check authentication (reference @auth.js)
    isAuthenticated: () => {
        const authStore = useAuthStore.getState();
        return authStore.isAuthenticated;
    },

    // Helper to build URL with automatic schoolId injection (reference @auth.js)
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

    // Helper to wait for authentication (reference @auth.js)
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

    // ===== FACILITY OPERATIONS =====
    fetchFacilities: async (filters = {}) => {
        set((state) => ({ loading: { ...state.loading, facilities: true } }));
        try {
            await get().waitForAuth();
            const url = get().buildUrl("/api/facility", filters);
            const res = await fetch(url);
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.message || "Failed to fetch facilities");
            }
            set((state) => ({
                facilities: data.data,
                loading: { ...state.loading, facilities: false },
                errors: { ...state.errors, facilities: null },
            }));
            return { success: true, data: data.data };
        } catch (error) {
            set((state) => ({
                loading: { ...state.loading, facilities: false },
                errors: { ...state.errors, facilities: error.message },
            }));
            return { success: false, message: error.message };
        }
    },
    createFacility: async (facilityData) => {
        try {
            const authStore = useAuthStore.getState();
            const userContext = authStore.getCurrentUser();
            if (userContext.role === "schoolAdmin") {
                const schoolId = authStore.getSchoolId();
                if (schoolId) {
                    facilityData.schoolId = schoolId;
                }
            }
            const res = await fetch("/api/facility", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(facilityData),
            });
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.message || "Failed to create facility");
            }
            set((state) => ({ facilities: [...state.facilities, data.data] }));
            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    updateFacility: async (id, updates) => {
        try {
            const res = await fetch(`/api/facility/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates),
            });
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.message || "Failed to update facility");
            }
            set((state) => ({
                facilities: state.facilities.map((facility) =>
                    facility._id === id ? data.data : facility
                ),
            }));
            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    deleteFacility: async (id) => {
        try {
            const res = await fetch(`/api/facility/${id}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.message || "Failed to delete facility");
            }
            set((state) => ({
                facilities: state.facilities.filter((facility) => facility._id !== id),
            }));
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    // ===== BOOKING OPERATIONS =====
    fetchBookings: async (filters = {}) => {
        set((state) => ({ loading: { ...state.loading, bookings: true } }));
        try {
            await get().waitForAuth();
            const url = get().buildUrl("/api/booking", filters);
            const res = await fetch(url);
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.message || "Failed to fetch bookings");
            }
            set((state) => ({
                bookings: data.data,
                loading: { ...state.loading, bookings: false },
                errors: { ...state.errors, bookings: null },
            }));
            return { success: true, data: data.data };
        } catch (error) {
            set((state) => ({
                loading: { ...state.loading, bookings: false },
                errors: { ...state.errors, bookings: error.message },
            }));
            return { success: false, message: error.message };
        }
    },
    createBooking: async (bookingData) => {
        try {
            const authStore = useAuthStore.getState();
            const userContext = authStore.getCurrentUser();
            if (userContext.role === "schoolAdmin" || userContext.role === "student") {
                const schoolId = authStore.getSchoolId();
                if (schoolId) {
                    bookingData.schoolId = schoolId;
                }
            }
            const res = await fetch("/api/booking", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bookingData),
            });
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.message || "Failed to create booking");
            }
            set((state) => ({ bookings: [...state.bookings, data.data] }));
            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    updateBooking: async (id, updates) => {
        try {
            const res = await fetch(`/api/booking/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates),
            });
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.message || "Failed to update booking");
            }
            set((state) => ({
                bookings: state.bookings.map((booking) =>
                    booking._id === id ? data.data : booking
                ),
            }));
            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    deleteBooking: async (id) => {
        try {
            const res = await fetch(`/api/booking/${id}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.message || "Failed to delete booking");
            }
            set((state) => ({
                bookings: state.bookings.filter((booking) => booking._id !== id),
            }));
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    // ===== RESOURCE OPERATIONS =====
    fetchResources: async (filters = {}) => {
        set((state) => ({ loading: { ...state.loading, resources: true } }));
        try {
            await get().waitForAuth();
            const url = get().buildUrl("/api/resource", filters);
            const res = await fetch(url);
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.message || "Failed to fetch resources");
            }
            set((state) => ({
                resources: data.data,
                loading: { ...state.loading, resources: false },
                errors: { ...state.errors, resources: null },
            }));
            return { success: true, data: data.data };
        } catch (error) {
            set((state) => ({
                loading: { ...state.loading, resources: false },
                errors: { ...state.errors, resources: error.message },
            }));
            return { success: false, message: error.message };
        }
    },
    createResource: async (resourceData) => {
        try {
            const authStore = useAuthStore.getState();
            const userContext = authStore.getCurrentUser();
            if (userContext.role === "schoolAdmin") {
                const schoolId = authStore.getSchoolId();
                if (schoolId) {
                    resourceData.schoolId = schoolId;
                }
            }
            const res = await fetch("/api/resource", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(resourceData),
            });
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.message || "Failed to create resource");
            }
            set((state) => ({ resources: [...state.resources, data.data] }));
            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    updateResource: async (id, updates) => {
        try {
            const res = await fetch(`/api/resource/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates),
            });
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.message || "Failed to update resource");
            }
            set((state) => ({
                resources: state.resources.map((resource) =>
                    resource._id === id ? data.data : resource
                ),
            }));
            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    deleteResource: async (id) => {
        try {
            const res = await fetch(`/api/resource/${id}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.message || "Failed to delete resource");
            }
            set((state) => ({
                resources: state.resources.filter((resource) => resource._id !== id),
            }));
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    // ===== TIME SLOT OPERATIONS =====
    fetchTimeSlots: async (filters = {}) => {
        set((state) => ({ loading: { ...state.loading, timeSlots: true } }));
        try {
            await get().waitForAuth();
            const url = get().buildUrl("/api/timeSlot", filters);
            const res = await fetch(url);
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.message || "Failed to fetch time slots");
            }
            set((state) => ({
                timeSlots: data.data,
                loading: { ...state.loading, timeSlots: false },
                errors: { ...state.errors, timeSlots: null },
            }));
            return { success: true, data: data.data };
        } catch (error) {
            set((state) => ({
                loading: { ...state.loading, timeSlots: false },
                errors: { ...state.errors, timeSlots: error.message },
            }));
            return { success: false, message: error.message };
        }
    },
    createTimeSlot: async (timeSlotData) => {
        try {
            const authStore = useAuthStore.getState();
            const userContext = authStore.getCurrentUser();
            if (userContext.role === "schoolAdmin") {
                const schoolId = authStore.getSchoolId();
                if (schoolId) {
                    timeSlotData.schoolId = schoolId;
                }
            }
            const res = await fetch("/api/timeSlot", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(timeSlotData),
            });
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.message || "Failed to create time slot");
            }
            set((state) => ({ timeSlots: [...state.timeSlots, data.data] }));
            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    updateTimeSlot: async (id, updates) => {
        try {
            const res = await fetch(`/api/timeSlot/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates),
            });
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.message || "Failed to update time slot");
            }
            set((state) => ({
                timeSlots: state.timeSlots.map((timeSlot) =>
                    timeSlot._id === id ? data.data : timeSlot
                ),
            }));
            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    deleteTimeSlot: async (id) => {
        try {
            const res = await fetch(`/api/timeSlot/${id}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.message || "Failed to delete time slot");
            }
            set((state) => ({
                timeSlots: state.timeSlots.filter((timeSlot) => timeSlot._id !== id),
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
                facilities: null,
                bookings: null,
                resources: null,
                timeSlots: null,
            },
        }));
    },
    clearData: () => {
        set({
            facilities: [],
            bookings: [],
            resources: [],
            timeSlots: [],
        });
    },
}));
