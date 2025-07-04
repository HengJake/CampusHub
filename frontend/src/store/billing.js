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

            return { success: true, message: data.message, data: data.data };

        } catch (error) {
            console.error("Error fetching all subscription:", error.message);
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

            return { success: true, message: data.message, data: data.data };
        } catch (error) {
            console.error("Error fetching all subscription:", error.message);
            return { success: false, message: error.message };
        }
    },

}))