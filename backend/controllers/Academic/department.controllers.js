import Department from "../../models/Academic/department.model.js";
import Room from "../../models/Academic/room.model.js";
import {
    createRecord,
    getAllRecords,
    getRecordById,
    updateRecord,
    deleteRecord,
    validateReferenceExists,
    validateMultipleReferences,
    controllerWrapper
} from "../../utils/reusable.js";

// Custom validation function for department data
const validateDepartmentData = async (data) => {
    const { departmentName, DepartmentDescription, RoomID } = data;

    // Check required fields
    if (!departmentName || !DepartmentDescription || !RoomID) {
        return {
            isValid: false,
            message: "Please provide all required fields (departmentName, DepartmentDescription, RoomID)"
        };
    }

    // Validate references exist
    const referenceValidation = await validateMultipleReferences({
        roomID: { id: RoomID, Model: Room }
    });

    if (referenceValidation) {
        return {
            isValid: false,
            message: referenceValidation.message
        };
    }

    return { isValid: true };
};

// Create Department
export const createDepartment = controllerWrapper(async (req, res) => {
    return await createRecord(
        Department,
        req.body,
        "department",
        validateDepartmentData
    );
});

// Get All Departments
export const getDepartments = controllerWrapper(async (req, res) => {
    return await getAllRecords(
        Department,
        "departments",
        ['RoomID']
    );
});

// Get Department by ID
export const getDepartmentById = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await getRecordById(
        Department,
        id,
        "department",
        ['RoomID']
    );
});

// Update Department
export const updateDepartment = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await updateRecord(
        Department,
        id,
        req.body,
        "department",
        validateDepartmentData
    );
});

// Delete Department
export const deleteDepartment = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await deleteRecord(Department, id, "department");
});