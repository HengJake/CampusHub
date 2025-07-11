import Lecturer from "../../models/Academic/lecturer.model.js";
import Department from "../../models/Academic/department.model.js";
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

// Custom validation function for lecturer data
const validateLecturerData = async (data) => {
    const { UserID, DepartmentID } = data;

    // Check required fields
    if (!UserID|| !DepartmentID) {
        return {
            isValid: false,
            message: "Please provide all required fields (UserID, DepartmentID)"
        };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(LecturerEmail)) {
        return {
            isValid: false,
            message: "Please provide a valid email address"
        };
    }

    // Validate references exist
    const referenceValidation = await validateMultipleReferences({
        departmentID: { id: DepartmentID, Model: Department }
    });

    if (referenceValidation) {
        return {
            isValid: false,
            message: referenceValidation.message
        };
    }

    return { isValid: true };
};

// Create Lecturer
export const createLecturer = controllerWrapper(async (req, res) => {
    return await createRecord(
        Lecturer,
        req.body,
        "lecturer",
        validateLecturerData
    );
});

// Get All Lecturers
export const getLecturers = controllerWrapper(async (req, res) => {
    return await getAllRecords(
        Lecturer,
        "lecturers",
        ['DepartmentID']
    );
});

// Get Lecturer by ID
export const getLecturerById = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await getRecordById(
        Lecturer,
        id,
        "lecturer",
        ['DepartmentID']
    );
});

// Update Lecturer
export const updateLecturer = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await updateRecord(
        Lecturer,
        id,
        req.body,
        "lecturer",
        validateLecturerData
    );
});

// Delete Lecturer
export const deleteLecturer = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await deleteRecord(Lecturer, id, "lecturer");
});