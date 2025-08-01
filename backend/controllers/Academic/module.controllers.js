import Module from "../../models/Academic/module.model.js";
import Course from "../../models/Academic/course.model.js";

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
    const { moduleName, code, moduleDescription, totalCreditHours } = data;

    // Check required fields
    if (!moduleName || !code || !moduleDescription || !totalCreditHours) {
        return {
            isValid: false,
            message: "Please provide all required fields (moduleName, code, moduleDescription, totalCreditHours)"
        };
    }

    // Validate totalCreditHours is a positive number
    if (totalCreditHours <= 0) {
        return {
            isValid: false,
            message: "totalCreditHours must be a positive number"
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