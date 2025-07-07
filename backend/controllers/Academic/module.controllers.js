import Module from "../../models/Academic/module.model.js";
import {
    createRecord,
    getAllRecords,
    getRecordById,
    updateRecord,
    deleteRecord,
    controllerWrapper
} from "../../utils/reusable.js";

// Custom validation function for module data
const validateModuleData = async (data) => {
    const { ModuleName, ModuleCode, ModuleDescription, CreditHours } = data;

    // Check required fields
    if (!ModuleName || !ModuleCode || !ModuleDescription || !CreditHours) {
        return {
            isValid: false,
            message: "Please provide all required fields (ModuleName, ModuleCode, ModuleDescription, CreditHours)"
        };
    }

    // Validate CreditHours is a positive number
    if (CreditHours <= 0) {
        return {
            isValid: false,
            message: "CreditHours must be a positive number"
        };
    }

    return { isValid: true };
};

// Create Module
export const createModule = controllerWrapper(async (req, res) => {
    return await createRecord(
        Module,
        req.body,
        "module",
        validateModuleData
    );
});

// Get All Modules
export const getModules = controllerWrapper(async (req, res) => {
    return await getAllRecords(Module, "modules");
});

// Get Module by ID
export const getModuleById = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await getRecordById(Module, id, "module");
});

// Update Module
export const updateModule = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await updateRecord(
        Module,
        id,
        req.body,
        "module",
        validateModuleData
    );
});

// Delete Module
export const deleteModule = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await deleteRecord(Module, id, "module");
});