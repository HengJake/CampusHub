import { create } from "zustand";

export const useBillingStore = create((set) => ({

    // subscription
    getAllSubscription: async () => {
        try {
            const res = await fetch(`/api/subscription`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });


            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.message || "Failed to fetch all subscription");
            }

            return { success: true, message: data.message, data: data.data };
        } catch (error) {
            console.error("Error fetching all subscription:", error.message);
            return { success: false, message: error.message };
        }
    },
    getSubscription: async (id) => {
        try {
            const res = await fetch(`/api/subscription/${id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });


            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.message || "Failed to fetch subscription");
            }

            return { success: true, message: data.message, data: data.data };
        } catch (error) {
            console.error("Error fetching all subscription:", error.message);
            return { success: false, message: error.message };
        }
    },
    // school
    createSchool: async (schoolDetails) => {
        try {

            const res = await fetch("/api/school", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(schoolDetails)
            })

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.message || "Failed to create School");
            }

            return { success: true, message: data.message, id: data.data._id };

        } catch (error) {
            console.error("Error fetching all subscription:", error.message);
            return { success: false, message: error.message };
        }
    },
    deleteSchool: async (schoolId) => {
        try {
            const res = await fetch(`/api/school/${schoolId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.message || "Failed to delete School");
            }

            return { success: true, message: data.message, data: data.data };
        } catch (error) {
            console.error("Error deleting school:", error.message);
            return { success: false, message: error.message };
        }
    },
    // payment
    createPayment: async (paymentDetails) => {

        try {
            const res = await fetch(`/api/payment`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(paymentDetails)
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.message || "Failed to log payment");
            }

            return { success: true, message: data.message, data: data.data, id: data.data._id };
        } catch (error) {
            console.error("Error fetching all subscription:", error.message);
            return { success: false, message: error.message };
        }
    },
    deletePayment: async (paymentId) => {
        try {
            const res = await fetch(`/api/payment/${paymentId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.message || "Failed to delete payment");
            }

            return { success: true, message: data.message, data: data.data };
        } catch (error) {
            console.error("Error creating payment:", error.message);
            return { success: false, message: error.message };
        }
    },
    // invoice
    createInvoice: async (invoice) => {
        try {
            const res = await fetch(`/api/invoice`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(invoice),
            });
    
            const data = await res.json();
    
            if (!res.ok || !data.success) {
                throw new Error(data.message || "Failed to create invoice");
            }
    
            return { success: true, message: data.message, data: data.data, id: data.data._id };
    
        } catch (error) {
            console.error("Error creating invoice:", error.message);
            return { success: false, message: error.message };
        }
    }

}))