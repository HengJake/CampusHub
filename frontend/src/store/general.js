import { create } from "zustand";

export const useGeneralStore = create((set, get) => ({
    exportTemplate: async (columns, prefilledData, fileName) => {

        const parcel = { columns: columns, prefilledData: prefilledData, fileName: fileName };
        console.log("🚀 ~ exportTemplate: ~ parcel:", parcel)

        try {
            const response = await fetch("/export", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(parcel)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to export template");
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${parcel.fileName}.xlsx`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            
            return { success: true, message: `${fileName}.xlsx template has been downloaded` };

        } catch (error) {
            console.error(error.message);
            return { success: false, message: error.message };
        }
    }
}))