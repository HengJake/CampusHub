import Student from "../../models/Academic/student.model.js";
import User from "../../models/Academic/user.model.js";
import School from "../../models/Billing/school.model.js";
import Course from "../../models/Academic/course.model.js";
import Intake from "../../models/Academic/intake.model.js";
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

// Custom validation function for student data
const validateStudentData = async (data) => {
    const { UserID, SchoolID, IntakeID, CourseID, Year } = data;

    // Check required fields
    if (!UserID || !SchoolID || !IntakeID || !CourseID || !Year) {
        return {
            isValid: false,
            message: "All fields (UserID, SchoolID, IntakeID, CourseID, Year) are required"
        };
    }

    // Validate Year range
    if (!Number.isInteger(Number(Year)) || Number(Year) < 1 || Number(Year) > 5) {
        return {
            isValid: false,
            message: "Year must be an integer between 1 and 5"
        };
    }

    // Validate references exist
    const referenceValidation = await validateMultipleReferences({
        userID: { id: UserID, Model: User },
        schoolID: { id: SchoolID, Model: School },
        intakeID: { id: IntakeID, Model: Intake },
        courseID: { id: CourseID, Model: Course }
    });

    if (referenceValidation) {
        return {
            isValid: false,
            message: referenceValidation.message
        };
    }

    return { isValid: true };
};

// Create Student
export const createStudent = controllerWrapper(async (req, res) => {
    return await createRecord(
        Student,
        req.body,
        "student",
        validateStudentData
    );
});

// Get All Students
export const getAllStudents = controllerWrapper(async (req, res) => {
    return await getAllRecords(
        Student,
        "students",
        ['UserID', 'SchoolID', 'IntakeID', 'CourseID']
    );
});

// Get Student by ID
export const getStudentById = controllerWrapper(async (req, res) => {
    const { UserID } = req.params;
    return await getRecordById(
        Student,
        UserID,
        "student",
        ['UserID', 'SchoolID', 'IntakeID', 'CourseID']
    );
});

// Update Student
export const updateStudentById = controllerWrapper(async (req, res) => {
    const { UserID } = req.params;
    return await updateRecord(
        Student,
        UserID,
        req.body,
        "student",
        validateStudentData
    );
});

// Delete Student
export const deleteStudentById = controllerWrapper(async (req, res) => {
    const { UserID } = req.params;
    return await deleteRecord(Student, UserID, "student");
});

// Get Students by School ID
export const getStudentsBySchoolId = controllerWrapper(async (req, res) => {
    const { SchoolID } = req.params;
    return await getAllRecords(
        Student,
        "students",
        ['UserID', 'SchoolID', 'IntakeID', 'CourseID'],
        { SchoolID }
    );
});

// Get Students by Intake ID
export const getStudentsByIntakeID = controllerWrapper(async (req, res) => {
    const { IntakeID } = req.params;
    return await getAllRecords(
        Student,
        "students",
        ['UserID', 'SchoolID', 'IntakeID', 'CourseID'],
        { IntakeID }
    );
});

// Get Students by Course ID
export const getStudentsByCourseId = controllerWrapper(async (req, res) => {
    const { CourseID } = req.params;
    return await getAllRecords(
        Student,
        "students",
        ['UserID', 'SchoolID', 'IntakeID', 'CourseID'],
        { CourseID }
    );
});

// Get Students by Year
export const getStudentsByYear = controllerWrapper(async (req, res) => {
    const { year } = req.params;

    // Validate year parameter
    if (!Number.isInteger(Number(year)) || Number(year) < 1 || Number(year) > 5) {
        return {
            success: false,
            message: "Year must be an integer between 1 and 5",
            statusCode: 400
        };
    }

    return await getAllRecords(
        Student,
        "students",
        ['UserID', 'SchoolID', 'IntakeID', 'CourseID'],
        { Year: Number(year) }
    );
});