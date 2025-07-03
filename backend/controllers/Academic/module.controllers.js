import Module from "../../models/Academic/module.model.js";
import mongoose from "mongoose";

// Create Module
export const createModule = async (req, res) => {
    const { ModuleName, ModuleCode, ModuleDescription, CreditHours } = req.body;

    // Validate required fields
    if (!ModuleName || !ModuleCode || !ModuleDescription || !CreditHours) {
        return res.status(400).json({
            success: false,
            message: "Please provide all required fields (ModuleName, ModuleCode, ModuleDescription, CreditHours)",
        });
    }

    try {
        const newModule = new Module({
            ModuleName,
            ModuleCode,
            ModuleDescription,
            CreditHours
        });

        await newModule.save();

        return res.status(201).json({
            success: true,
            data: newModule,
            message: "Module created successfully"
        });
    } catch (error) {
        console.error("Error creating module:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// Read Modules
export const getModules = async (req, res) => {
    try {
        const modules = await Module.find();

        return res.status(200).json({
            success: true,
            data: modules,
        });
    } catch (error) {
        console.error("Error fetching modules:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

// Update Module
export const updateModule = async (req, res) => {
    const { id } = req.params;
    const { ModuleName, ModuleCode, ModuleDescription, CreditHours } = req.body;

    // Validate required fields
    if (!ModuleName || !ModuleCode || !ModuleDescription || !CreditHours) {
        return res.status(400).json({
            success: false,
            message: "Please provide all required fields (ModuleName, ModuleCode, ModuleDescription, CreditHours)",
        });
    }

    try {
        const updatedModule = await Module.findByIdAndUpdate(
            id,
            { ModuleName, ModuleCode, ModuleDescription, CreditHours },
            { new: true }
        );

        if (!updatedModule) {
            return res.status(404).json({
                success: false,
                message: "Module not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: updatedModule,
            message: "Module updated successfully"
        });
    } catch (error) {
        console.error("Error updating module:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// Delete Module
export const deleteModule = async (req, res) => {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid module ID format"
        });
    }

    try {
        const deletedModule = await Module.findByIdAndDelete(id);

        if (!deletedModule) {
            return res.status(404).json({
                success: false,
                message: "Module not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Module deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting module:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};