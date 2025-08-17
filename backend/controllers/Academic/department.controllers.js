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
    controllerWrapper,
    deleteAllRecords
} from "../../utils/reusable.js";

// Custom validation function for department data
const validateDepartmentData = async (data) => {
    const { departmentName, departmentDescription, roomId } = data;

    // Check required fields
    if (!departmentName || !departmentDescription || !roomId) {
        return {
            isValid: false,
            message: "Please provide all required fields (departmentName, departmentDescription, roomId)"
        };
    }

    // Validate references exist
    const referenceValidation = await validateMultipleReferences({
        roomId: { id: roomId, Model: Room }
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
        ['roomId']
    );
});

// Get Department by ID
export const getDepartmentById = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await getRecordById(
        Department,
        id,
        "department",
        ['roomId']
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
// Delete All Departments
export const deleteAllDepartments = controllerWrapper(async (req, res) => {
    return await deleteAllRecords(Department, "departments");
});

export const getDepartmentsBySchoolId = controllerWrapper(async (req, res) => {
    const { schoolId } = req.params;
    return await getAllRecords(
        Department,
        "departments",
        ["schoolId"],
        { schoolId }
    );
});