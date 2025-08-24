// Programmer Name : Heng Jun Kai, Project Manager, Leader Full Stack developer
// Program Name: transportation.js
// Description: Transportation management store handling bus schedules, routes, stops, and e-hailing services for campus mobility
// First Written on: July 18, 2024
// Edited on: Friday, August 10, 2024

import { create } from "zustand";
import { useAuthStore } from "./auth.js";

export const useTransportationStore = create((set, get) => ({
    // State - Store data for each entity
    busSchedules: [],
    eHailings: [],
    routes: [],
    stops: [],
    vehicles: [],

    // Loading states
    loading: {
        busSchedules: false,
        eHailings: false,
        routes: false,
        stops: false,
        vehicles: false,
    },

    // Error states
    errors: {
        busSchedules: null,
        eHailings: null,
        routes: null,
        stops: null,
        vehicles: null,
    },

    // Cache timestamps to prevent unnecessary refetches
    lastFetched: {
        busSchedules: null,
        eHailings: null,
        routes: null,
        stops: null,
        vehicles: null,
    },

    // Cache duration in milliseconds (5 minutes)
    CACHE_DURATION: 5 * 60 * 1000,

    // Test function to verify store is working
    testStore: () => {

        return { success: true, message: 'Store is working' };
    },

    // Helper to get schoolId from auth store
    getSchoolId: () => {
        try {
            const authStore = useAuthStore.getState();
            const schoolId = authStore.getSchoolId();
            return schoolId;
        } catch (error) {
            console.error('🚀 Error getting school ID:', error);
            return null;
        }
    },

    // Helper to get current user context
    getCurrentUser: () => {
        try {
            const authStore = useAuthStore.getState();
            const userContext = authStore.getCurrentUser();
            return userContext;
        } catch (error) {
            console.error('🚀 Error getting current user:', error);
            return null;
        }
    },

    // Helper to check authentication
    isAuthenticated: () => {
        try {
            const authStore = useAuthStore.getState();
            const isAuth = authStore.isAuthenticated;
            return isAuth;
        } catch (error) {
            console.error('🚀 Error checking authentication:', error);
            return false;
        }
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

    // Helper to check if data is still fresh
    isDataFresh: (dataType) => {
        const state = get();
        const lastFetched = state.lastFetched[dataType];
        if (!lastFetched) return false;

        const now = Date.now();
        return (now - lastFetched) < state.CACHE_DURATION;
    },

    // Helper to check if we should fetch data
    shouldFetchData: (dataType) => {
        const state = get();
        return !state.loading[dataType] && !state.isDataFresh(dataType);
    },

    // ===== BUS SCHEDULE OPERATIONS =====
    fetchBusSchedules: async (filters = {}, forceRefresh = false) => {
        const state = get();

        // Check if we should fetch data
        if (!forceRefresh && !state.shouldFetchData('busSchedules')) {
            return { success: true, data: state.busSchedules, fromCache: true };
        }

        // Only set loading if not already loading
        set((state) => {
            if (state.loading.busSchedules) return state;
            return { loading: { ...state.loading, busSchedules: true } };
        });

        try {
            const url = state.buildUrl("/api/bus-schedule", filters);

            const res = await fetch(url);
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to fetch bus schedules");
            }

            set((state) => ({
                busSchedules: data.data,
                loading: { ...state.loading, busSchedules: false },
                errors: { ...state.errors, busSchedules: null },
                lastFetched: { ...state.lastFetched, busSchedules: Date.now() }
            }));

            return { success: true, data: data.data };
        } catch (error) {
            set((state) => ({
                loading: { ...state.loading, busSchedules: false },
                errors: { ...state.errors, busSchedules: null },
            }));
            return { success: false, message: error.message };
        }
    },

    fetchBusSchedulesBySchoolId: async (filters = {}, forceRefresh = false) => {
        const state = get();

        // Check if we should fetch data
        if (!forceRefresh && !state.shouldFetchData('busSchedules')) {
            return { success: true, data: state.busSchedules, fromCache: true };
        }

        // Only set loading if not already loading
        set((state) => {
            if (state.loading.busSchedules) return state;
            return { loading: { ...state.loading, busSchedules: true } };
        });

        try {
            const authStore = useAuthStore.getState();
            const schoolId = authStore.getSchoolId();
            if (!schoolId) {
                throw new Error("School ID not found");
            }

            const url = state.buildUrl(`/api/bus-schedule/school/${schoolId}`, filters);

            const res = await fetch(url);
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to fetch bus schedules");
            }

            set((state) => ({
                busSchedules: data.data,
                loading: { ...state.loading, busSchedules: false },
                errors: { ...state.errors, busSchedules: null },
                lastFetched: { ...state.lastFetched, busSchedules: Date.now() }
            }));

            return { success: true, data: data.data };
        } catch (error) {
            console.error('🚀 Error fetching bus schedules:', error);
            set((state) => ({
                loading: { ...state.loading, busSchedules: false },
                errors: { ...state.errors, busSchedules: null },
            }));
            return { success: false, message: error.message };
        }
    },


    createBusSchedule: async (busScheduleData) => {
        try {
            const authStore = useAuthStore.getState();
            const userContext = authStore.getCurrentUser();
            if (userContext.role === "schoolAdmin") {
                const schoolId = authStore.getSchoolId();
                if (schoolId) {
                    busScheduleData.schoolId = schoolId;
                }
            }
            const res = await fetch("/api/bus-schedule", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(busScheduleData),
            });
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.message || "Failed to create bus schedule");
            }

            // Ensure the new record has all required fields including _id
            if (data.data && data.data._id) {
                set((state) => ({
                    busSchedules: [...state.busSchedules, data.data],
                    // Reset cache to force fresh fetch on next request
                    lastFetched: { ...state.lastFetched, busSchedules: null }
                }));
            } else {
                console.error('🚀 Created bus schedule missing _id:', data.data);
            }

            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    updateBusSchedule: async (id, updates) => {
        try {
            const res = await fetch(`/api/bus-schedule/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates),
            });
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.message || "Failed to update bus schedule");
            }
            set((state) => ({
                busSchedules: state.busSchedules.map((item) =>
                    item._id === id ? data.data : item
                ),
            }));
            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    deleteBusSchedule: async (id) => {
        try {
            const res = await fetch(`/api/bus-schedule/${id}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.message || "Failed to delete bus schedule");
            }
            set((state) => ({
                busSchedules: state.busSchedules.filter((item) => item._id !== id),
            }));
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    // ===== E-HAILING OPERATIONS =====
    fetchEHailings: async (filters = {}, forceRefresh = false) => {
        const state = get();

        if (!forceRefresh && !state.shouldFetchData('eHailings')) {
            return { success: true, data: state.eHailings, fromCache: true };
        }

        set((state) => {
            if (state.loading.eHailings) return state;
            return { loading: { ...state.loading, eHailings: true } };
        });

        try {
            const url = state.buildUrl("/api/e-hailing", filters);
            const res = await fetch(url);
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.message || "Failed to fetch eHailings");
            }
            set((state) => ({
                eHailings: data.data,
                loading: { ...state.loading, eHailings: false },
                errors: { ...state.errors, eHailings: null },
                lastFetched: { ...state.lastFetched, eHailings: Date.now() }
            }));
            return { success: true, data: data.data };
        } catch (error) {
            set((state) => ({
                loading: { ...state.loading, eHailings: false },
                errors: { ...state.errors, eHailings: error.message },
            }));
            return { success: false, message: error.message };
        }
    },

    fetchEHailingsBySchoolId: async (filters = {}, forceRefresh = false) => {
        const state = get();

        if (!forceRefresh && !state.shouldFetchData('eHailings')) {
            return { success: true, data: state.eHailings, fromCache: true };
        }

        set((state) => {
            if (state.loading.eHailings) return state;
            return { loading: { ...state.loading, eHailings: true } };
        });

        try {
            const authStore = useAuthStore.getState();
            const schoolId = authStore.getSchoolId();
            if (!schoolId) {
                throw new Error("School ID not found");
            }

            const url = state.buildUrl(`/api/e-hailing/school/${schoolId}`, filters);
            const res = await fetch(url);
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.message || "Failed to fetch eHailings");
            }
            set((state) => ({
                eHailings: data.data,
                loading: { ...state.loading, eHailings: false },
                errors: { ...state.errors, eHailings: null },
                lastFetched: { ...state.lastFetched, eHailings: Date.now() }
            }));
            return { success: true, data: data.data };
        } catch (error) {
            set((state) => ({
                loading: { ...state.loading, eHailings: false },
                errors: { ...state.errors, eHailings: null },
            }));
            return { success: false, message: error.message };
        }
    },

    fetchEHailingsByStudentId: async (studentId, filters = {}, forceRefresh = false) => {
        const state = get();

        if (!forceRefresh && !state.shouldFetchData('eHailings')) {
            return { success: true, data: state.eHailings, fromCache: true };
        }

        set((state) => {
            if (state.loading.eHailings) return state;
            return { loading: { ...state.loading, eHailings: true } };
        });

        try {
            if (!studentId) {
                throw new Error("Student ID not found");
            }

            const url = `/api/e-hailing/student/${studentId}`;
            const res = await fetch(url);
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.message || "Failed to fetch eHailings");
            }
            set((state) => ({
                eHailings: data.data,
                loading: { ...state.loading, eHailings: false },
                errors: { ...state.errors, eHailings: null },
                lastFetched: { ...state.lastFetched, eHailings: Date.now() }
            }));
            return { success: true, data: data.data };
        } catch (error) {
            set((state) => ({
                loading: { ...state.loading, eHailings: false },
                errors: { ...state.errors, eHailings: null },
            }));
            return { success: false, message: error.message };
        }
    },
    createEHailing: async (eHailingData) => {
        try {
            const authStore = useAuthStore.getState();
            const schoolId = authStore.getSchoolId();

            if (!schoolId) {
                throw new Error("School ID not found");
            }

            // Add schoolId to the eHailing data
            eHailingData.schoolId = schoolId;

            // Note: vehicleId is now automatically assigned by the backend
            // No need to specify it in the request

            const res = await fetch("/api/e-hailing", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(eHailingData),
            });
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.message || "Failed to create eHailing");
            }

            // Ensure the new record has all required fields including _id
            if (data.data && data.data._id) {
                set((state) => ({
                    eHailings: [...state.eHailings, data.data],
                    // Reset cache to force fresh fetch on next request
                    lastFetched: { ...state.lastFetched, eHailings: null }
                }));
            } else {
                console.error('🚀 Created eHailing missing _id:', data.data);
            }

            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    updateEHailing: async (id, updates) => {
        try {
            const res = await fetch(`/api/e-hailing/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates),
            });
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.message || "Failed to update eHailing");
            }
            set((state) => ({
                eHailings: state.eHailings.map((item) =>
                    item._id === id ? data.data : item
                ),
            }));
            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    updateEHailingStatus: async (id, updates) => {
        try {
            const res = await fetch(`/api/e-hailing/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates),
            });
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.message || "Failed to update eHailing status");
            }

            // Update the local state
            set((state) => ({
                eHailings: state.eHailings.map((item) =>
                    item._id === id ? { ...item, ...updates } : item
                ),
            }));

            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    deleteEHailing: async (id) => {
        try {
            const res = await fetch(`/api/e-hailing/${id}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.message || "Failed to delete eHailing");
            }
            set((state) => ({
                eHailings: state.eHailings.filter((item) => item._id !== id),
            }));
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    // ===== ROUTE OPERATIONS =====
    fetchRoutes: async (filters = {}, forceRefresh = false) => {
        const state = get();

        if (!forceRefresh && !state.shouldFetchData('routes')) {
            return { success: true, data: state.routes, fromCache: true };
        }

        set((state) => {
            if (state.loading.routes) return state;
            return { loading: { ...state.loading, routes: true } };
        });

        try {
            const url = state.buildUrl("/api/route", filters);
            const res = await fetch(url);
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.message || "Failed to fetch routes");
            }
            set((state) => ({
                routes: data.data,
                loading: { ...state.loading, routes: false },
                errors: { ...state.errors, routes: null },
                lastFetched: { ...state.lastFetched, routes: Date.now() }
            }));
            return { success: true, data: data.data };
        } catch (error) {
            set((state) => ({
                loading: { ...state.loading, routes: false },
                errors: { ...state.errors, routes: error.message },
            }));
            return { success: false, message: error.message };
        }
    },

    fetchRoutesBySchoolId: async (filters = {}, forceRefresh = false) => {
        const state = get();

        if (!forceRefresh && !state.shouldFetchData('routes')) {
            return { success: true, data: state.routes, fromCache: true };
        }

        set((state) => {
            if (state.loading.routes) return state;
            return { loading: { ...state.loading, routes: true } };
        });

        try {
            const authStore = useAuthStore.getState();
            const schoolId = authStore.getSchoolId();
            if (!schoolId) {
                throw new Error("School ID not found");
            }

            const url = state.buildUrl(`/api/route/school/${schoolId}`, filters);
            const res = await fetch(url);
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.message || "Failed to fetch routes");
            }
            set((state) => ({
                routes: data.data,
                loading: { ...state.loading, routes: false },
                errors: { ...state.errors, routes: null },
                lastFetched: { ...state.lastFetched, routes: Date.now() }
            }));
            return { success: true, data: data.data };
        } catch (error) {
            set((state) => ({
                loading: { ...state.loading, routes: false },
                errors: { ...state.errors, routes: null },
            }));
            return { success: false, message: error.message };
        }
    },


    createRoute: async (routeData) => {
        try {
            const authStore = useAuthStore.getState();
            const userContext = authStore.getCurrentUser();
            if (userContext.role === "schoolAdmin") {
                const schoolId = authStore.getSchoolId();
                if (schoolId) {
                    routeData.schoolId = schoolId;
                }
            }
            const res = await fetch("/api/route", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(routeData),
            });
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.message || "Failed to create route");
            }

            // Ensure the new record has all required fields including _id
            if (data.data && data.data._id) {
                set((state) => ({
                    routes: [...state.routes, data.data],
                    // Reset cache to force fresh fetch on next request
                    lastFetched: { ...state.lastFetched, routes: null }
                }));
            } else {
                console.error('🚀 Created route missing _id:', data.data);
            }

            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    updateRoute: async (id, updates) => {
        try {
            const res = await fetch(`/api/route/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates),
            });
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.message || "Failed to update route");
            }
            set((state) => ({
                routes: state.routes.map((item) =>
                    item._id === id ? data.data : item
                ),
            }));
            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    deleteRoute: async (id) => {
        try {
            const res = await fetch(`/api/route/${id}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.message || "Failed to delete route");
            }
            set((state) => ({
                routes: state.routes.filter((item) => item._id !== id),
            }));
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    // ===== STOP OPERATIONS =====
    fetchStops: async (filters = {}, forceRefresh = false) => {
        const state = get();

        if (!forceRefresh && !state.shouldFetchData('stops')) {
            return { success: true, data: state.stops, fromCache: true };
        }

        set((state) => {
            if (state.loading.stops) return state;
            return { loading: { ...state.loading, stops: true } };
        });

        try {
            const url = state.buildUrl("/api/stop", filters);
            const res = await fetch(url);
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.message || "Failed to fetch stops");
            }
            set((state) => ({
                stops: data.data,
                loading: { ...state.loading, stops: false },
                errors: { ...state.errors, stops: null },
                lastFetched: { ...state.lastFetched, stops: Date.now() }
            }));
            return { success: true, data: data.data };
        } catch (error) {
            set((state) => ({
                loading: { ...state.loading, stops: false },
                errors: { ...state.errors, stops: error.message },
            }));
            return { success: false, message: error.message };
        }
    },

    fetchStopsBySchoolId: async (filters = {}, forceRefresh = false) => {
        const state = get();

        if (!forceRefresh && !state.shouldFetchData('stops')) {
            return { success: true, data: state.stops, fromCache: true };
        }

        set((state) => {
            if (state.loading.stops) return state;
            return { loading: { ...state.loading, stops: true } };
        });

        try {
            const authStore = useAuthStore.getState();
            const schoolId = authStore.getSchoolId();
            if (!schoolId) {
                throw new Error("School ID not found");
            }

            const url = state.buildUrl(`/api/stop/school/${schoolId}`, filters);
            const res = await fetch(url);
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.message || "Failed to fetch stops");
            }
            set((state) => ({
                stops: data.data,
                loading: { ...state.loading, stops: false },
                errors: { ...state.errors, stops: null },
                lastFetched: { ...state.lastFetched, stops: Date.now() }
            }));
            return { success: true, data: data.data };
        } catch (error) {
            set((state) => ({
                loading: { ...state.loading, stops: false },
                errors: { ...state.errors, stops: null },
            }));
            return { success: false, message: error.message };
        }
    },

    fetchStopsByStudentId: async (studentId, filters = {}, forceRefresh = false) => {
        const state = get();

        if (!forceRefresh && !state.shouldFetchData('stops')) {
            return { success: true, data: state.stops, fromCache: true };
        }

        set((state) => {
            if (state.loading.stops) return state;
            return { loading: { ...state.loading, stops: true } };
        });

        try {
            const schoolId = get().getSchoolId();
            if (!schoolId) {
                throw new Error("School ID not found");
            }

            const url = `/api/stop/school/${schoolId}`;
            const res = await fetch(url);
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.message || "Failed to fetch stops");
            }
            set((state) => ({
                stops: data.data,
                loading: { ...state.loading, stops: false },
                errors: { ...state.errors, stops: null },
                lastFetched: { ...state.lastFetched, stops: Date.now() }
            }));
            return { success: true, data: data.data };
        } catch (error) {
            set((state) => ({
                loading: { ...state.loading, stops: false },
                errors: { ...state.errors, stops: null },
            }));
            return { success: false, message: error.message };
        }
    },
    createStop: async (stopData) => {
        try {
            const authStore = useAuthStore.getState();
            const userContext = authStore.getCurrentUser();
            if (userContext.role === "schoolAdmin") {
                const schoolId = authStore.getSchoolId();
                if (schoolId) {
                    stopData.schoolId = schoolId;
                }
            }

            const res = await fetch("/api/stop", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(stopData),
            });
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.message || "Failed to create stop");
            }

            // Ensure the new record has all required fields including _id
            if (data.data && data.data._id) {
                set((state) => ({
                    stops: [...state.stops, data.data],
                    // Reset cache to force fresh fetch on next request
                    lastFetched: { ...state.lastFetched, stops: null }
                }));
            } else {
                console.error('🚀 Created stop missing _id:', data.data);
            }

            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    updateStop: async (id, updates) => {
        try {
            const res = await fetch(`/api/stop/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates),
            });
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.message || "Failed to update stop");
            }
            set((state) => ({
                stops: state.stops.map((item) =>
                    item._id === id ? data.data : item
                ),
            }));
            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    deleteStop: async (id) => {
        try {
            const res = await fetch(`/api/stop/${id}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.message || "Failed to delete stop");
            }
            set((state) => ({
                stops: state.stops.filter((item) => item._id !== id),
            }));
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    // ===== VEHICLE OPERATIONS =====
    fetchVehicles: async (filters = {}, forceRefresh = false) => {
        const state = get();

        if (!forceRefresh && !state.shouldFetchData('vehicles')) {
            return { success: true, data: state.vehicles, fromCache: true };
        }

        set((state) => {
            if (state.loading.vehicles) return state;
            return { loading: { ...state.loading, vehicles: true } };
        });

        try {
            const url = state.buildUrl("/api/vehicle", filters);
            const res = await fetch(url);
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.message || "Failed to fetch vehicles");
            }
            set((state) => ({
                vehicles: data.data,
                loading: { ...state.loading, vehicles: false },
                errors: { ...state.errors, vehicles: null },
                lastFetched: { ...state.lastFetched, vehicles: Date.now() }
            }));
            return { success: true, data: data.data };
        } catch (error) {
            set((state) => ({
                loading: { ...state.loading, vehicles: false },
                errors: { ...state.errors, vehicles: error.message },
            }));
            return { success: false, message: error.message };
        }
    },

    fetchVehiclesBySchoolId: async (filters = {}, forceRefresh = false) => {
        const state = get();

        if (!forceRefresh && !state.shouldFetchData('vehicles')) {
            return { success: true, data: state.vehicles, fromCache: true };
        }

        set((state) => {
            if (state.loading.vehicles) return state;
            return { loading: { ...state.loading, vehicles: true } };
        });

        try {
            const authStore = useAuthStore.getState();
            const schoolId = authStore.getSchoolId();
            if (!schoolId) {
                throw new Error("School ID not found");
            }

            const url = state.buildUrl(`/api/vehicle/school/${schoolId}`, filters);
            const res = await fetch(url);
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.message || "Failed to fetch vehicles");
            }
            set((state) => ({
                vehicles: data.data,
                loading: { ...state.loading, vehicles: false },
                errors: { ...state.errors, vehicles: null },
                lastFetched: { ...state.lastFetched, vehicles: Date.now() }
            }));
            return { success: true, data: data.data };
        } catch (error) {
            set((state) => ({
                loading: { ...state.loading, vehicles: false },
                errors: { ...state.errors, vehicles: null },
            }));
            return { success: false, message: error.message };
        }
    },


    createVehicle: async (vehicleData) => {
        try {
            const authStore = useAuthStore.getState();
            const userContext = authStore.getCurrentUser();
            if (userContext.role === "schoolAdmin") {
                const schoolId = authStore.getSchoolId();
                if (schoolId) {
                    vehicleData.schoolId = schoolId;
                }
            }
            const res = await fetch("/api/vehicle", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(vehicleData),
            });
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.message || "Failed to create vehicle");
            }

            // Ensure the new record has all required fields including _id
            if (data.data && data.data._id) {
                set((state) => ({
                    vehicles: [...state.vehicles, data.data],
                    // Reset cache to force fresh fetch on next request
                    lastFetched: { ...state.lastFetched, vehicles: null }
                }));
            } else {
                console.error('🚀 Created vehicle missing _id:', data.data);
            }

            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    updateVehicle: async (id, updates) => {
        try {
            const res = await fetch(`/api/vehicle/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates),
            });
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.message || "Failed to update vehicle");
            }
            set((state) => ({
                vehicles: state.vehicles.map((item) =>
                    item._id === id ? data.data : item
                ),
            }));
            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    deleteVehicle: async (id) => {
        try {
            const res = await fetch(`/api/vehicle/${id}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.message || "Failed to delete vehicle");
            }
            set((state) => ({
                vehicles: state.vehicles.filter((item) => item._id !== id),
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
                busSchedules: null,
                eHailings: null,
                routes: null,
                stops: null,
                vehicles: null,
            },
        }));
    },
    clearData: () => {
        set({
            busSchedules: [],
            eHailings: [],
            routes: [],
            stops: [],
            vehicles: [],
            lastFetched: {
                busSchedules: null,
                eHailings: null,
                routes: null,
                stops: null,
                vehicles: null,
            }
        });
    },
    // Force refresh all data
    refreshAllData: async () => {
        const promises = [
            get().fetchBusSchedules({}, true),
            get().fetchVehicles({}, true),
            get().fetchStops({}, true),
            get().fetchRoutes({}, true)
        ];
        return Promise.all(promises);
    },
}));
