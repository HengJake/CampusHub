import Module from "../../models/Academic/module.model.js";
import {
    createRecord,
    getAllRecords,
    getRecordById,
    updateRecord,
    deleteRecord,
    controllerWrapper,
    deleteAllRecords
} from "../../utils/reusable.js";

// Custom validation function for module data
const validateModuleData = async (data) => {
    const { moduleName, code, moduleDescription, totalCreditHour } = data;

    // Check required fields
    if (!moduleName || !code || !moduleDescription || !totalCreditHour) {
        return {
            isValid: false,
            message: "Please provide all required fields (moduleName, code, moduleDescription, totalCreditHour)"
        };
    }

    // Validate totalCreditHour is a positive number
    if (totalCreditHour <= 0) {
        return {
            isValid: false,
            message: "totalCreditHour must be a positive number"
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
// Delete All Modules
export const deleteAllModules = controllerWrapper(async (req, res) => {
    return await deleteAllRecords(Module, "modules");
});

export const getModulesBySchool = controllerWrapper(async (req, res) => {
    const { schoolId } = req.params;
    return await getAllRecords(
        Module,
        "modules",
        ["schoolId", ["courseId"], ["prerequisites"]],
        { schoolId }
    );
});