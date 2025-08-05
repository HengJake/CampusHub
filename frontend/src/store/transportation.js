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

    // ===== BUS SCHEDULE OPERATIONS =====
    fetchBusSchedules: async (filters = {}) => {
        set((state) => ({ loading: { ...state.loading, busSchedules: true } }));
        try {
            const url = get().buildUrl("/api/bus-schedule", filters);
            const res = await fetch(url);
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.message || "Failed to fetch bus schedules");
            }
            set((state) => ({
                busSchedules: data.data,
                loading: { ...state.loading, busSchedules: false },
                errors: { ...state.errors, busSchedules: null },
            }));
            return { success: true, data: data.data };
        } catch (error) {
            set((state) => ({
                loading: { ...state.loading, busSchedules: false },
                errors: { ...state.errors, busSchedules: error.message },
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
            set((state) => ({ busSchedules: [...state.busSchedules, data.data] }));
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
    fetchEHailings: async (filters = {}) => {
        set((state) => ({ loading: { ...state.loading, eHailings: true } }));
        try {
            const url = get().buildUrl("/api/e-hailing", filters);
            const res = await fetch(url);
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.message || "Failed to fetch eHailings");
            }
            set((state) => ({
                eHailings: data.data,
                loading: { ...state.loading, eHailings: false },
                errors: { ...state.errors, eHailings: null },
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
    createEHailing: async (eHailingData) => {
        try {
            const authStore = useAuthStore.getState();
            const userContext = authStore.getCurrentUser();
            if (userContext.role === "schoolAdmin") {
                const schoolId = authStore.getSchoolId();
                if (schoolId) {
                    eHailingData.schoolId = schoolId;
                }
            }
            const res = await fetch("/api/e-hailing", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(eHailingData),
            });
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.message || "Failed to create eHailing");
            }
            set((state) => ({ eHailings: [...state.eHailings, data.data] }));
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
    fetchRoutes: async (filters = {}) => {
        set((state) => ({ loading: { ...state.loading, routes: true } }));
        try {
            const url = get().buildUrl("/api/route", filters);
            const res = await fetch(url);
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.message || "Failed to fetch routes");
            }
            set((state) => ({
                routes: data.data,
                loading: { ...state.loading, routes: false },
                errors: { ...state.errors, routes: null },
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
            set((state) => ({ routes: [...state.routes, data.data] }));
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
    fetchStops: async (filters = {}) => {
        set((state) => ({ loading: { ...state.loading, stops: true } }));
        try {
            const url = get().buildUrl("/api/stop", filters);
            const res = await fetch(url);
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.message || "Failed to fetch stops");
            }
            set((state) => ({
                stops: data.data,
                loading: { ...state.loading, stops: false },
                errors: { ...state.errors, stops: null },
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
            set((state) => ({ stops: [...state.stops, data.data] }));
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
    fetchVehicles: async (filters = {}) => {
        set((state) => ({ loading: { ...state.loading, vehicles: true } }));
        try {
            const url = get().buildUrl("/api/vehicle", filters);
            const res = await fetch(url);
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.message || "Failed to fetch vehicles");
            }
            set((state) => ({
                vehicles: data.data,
                loading: { ...state.loading, vehicles: false },
                errors: { ...state.errors, vehicles: null },
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
            set((state) => ({ vehicles: [...state.vehicles, data.data] }));
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
        });
    },
}));
