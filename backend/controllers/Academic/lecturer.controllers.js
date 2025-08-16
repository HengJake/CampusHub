import Lecturer from "../../models/Academic/lecturer.model.js";
import Department from "../../models/Academic/department.model.js";
import School from "../../models/Billing/school.model.js";
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

// Custom validation function for lecturer data
const validateLecturerData = async (data) => {
    const { departmentId, schoolId } = data;

    // Check required fields
    if (!departmentId || !schoolId) {
        return {
            isValid: false,
            message: "Please provide all required fields (schoolId, departmentId)"
        };
    }

    // Validate references exist
    const referenceValidation = await validateMultipleReferences({
        departmentId: { id: departmentId, Model: Department },
        schoolId: { id: schoolId, Model: School }
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
        validateLecturerData,
        ['userId']
    );
});

// Get All Lecturers
export const getLecturers = controllerWrapper(async (req, res) => {
    return await getAllRecords(
        Lecturer,
        "lecturers",
        ['departmentId', 'userId']
    );
});

// Get Lecturer by ID
export const getLecturerById = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await getRecordById(
        Lecturer,
        id,
        "lecturer",
        ['departmentId', 'userId']
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
// Delete All Lecturers
export const deleteAllLecturers = controllerWrapper(async (req, res) => {
    return await deleteAllRecords(Lecturer, "lecturers");
});

export const getLecturersBySchoolId = controllerWrapper(async (req, res) => {
    const { schoolId } = req.params;
    return await getAllRecords(
        Lecturer,
        "lecturers",
        ["departmentId", "schoolId", "userId"],
        { schoolId }
    );
});