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

// Custom validation function for module updates (partial validation)
const validateModuleUpdate = async (data) => {
    // For updates, we only validate the fields that are being updated
    // Since runValidators: true is set in updateRecord, Mongoose will handle validation
    // We just need to ensure the data structure is correct for the fields being updated
    
    // If no data is provided, that's invalid
    if (!data || Object.keys(data).length === 0) {
        return {
            isValid: false,
            message: "No update data provided"
        };
    }

    // Validate prerequisites if being updated
    if (data.prerequisites !== undefined && Array.isArray(data.prerequisites)) {
        // Check if all prerequisites are valid ObjectIds
        const mongoose = (await import('mongoose')).default;
        if (!data.prerequisites.every(prereq => mongoose.Types.ObjectId.isValid(prereq))) {
            return {
                isValid: false,
                message: "All prerequisites must be valid ObjectIds"
            };
        }
    }

    // Validate courseId if being updated
    if (data.courseId !== undefined && Array.isArray(data.courseId)) {
        // Check if all courseIds are valid ObjectIds
        const mongoose = (await import('mongoose')).default;
        if (!data.courseId.every(courseId => mongoose.Types.ObjectId.isValid(courseId))) {
            return {
                isValid: false,
                message: "All courseIds must be valid ObjectIds"
            };
        }
    }

    // For all other fields, let Mongoose handle validation with runValidators: true
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
    const res2 = await updateRecord(
        Module,
        id,
        req.body,
        "module",
        validateModuleUpdate
    );
 
    return res2;
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

export const getModulesBySchoolId = controllerWrapper(async (req, res) => {
    const { schoolId } = req.params;
    return await getAllRecords(
        Module,
        "modules",
        ["schoolId", "courseId", "prerequisites"],
        { schoolId }
    );
});