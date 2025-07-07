import Student from "../../models/Academic/student.model.js";
import User from "../../models/Academic/user.model.js";
import School from "../../models/Billing/school.model.js";
import Course from "../../models/Academic/course.model.js";
import Intake from "../../models/Academic/intake.model.js";
import IntakeCourse from "../../models/Academic/intakeCourse.model.js";
import {
    createRecord,
    getAllRecords,
    getRecordById,
    updateRecord,
    deleteRecord,
    validateMultipleReferences,
    controllerWrapper
} from "../../utils/reusable.js";

// Custom validation for student data
const validateStudentData = async (data) => {
    const { userId, schoolId, intakeCourseId } = data;
    if (!userId || !schoolId || !intakeCourseId) {
        return { isValid: false, message: "userId, schoolId, and intakeCourseId are required" };
    }
    const referenceValidation = await validateMultipleReferences({
        userId: { id: userId, Model: User },
        schoolId: { id: schoolId, Model: School },
        intakeCourseId: { id: intakeCourseId, Model: IntakeCourse }
    });
    if (referenceValidation) {
        return { isValid: false, message: referenceValidation.message };
    }
    return { isValid: true };
};

// Create Student
export const createStudent = controllerWrapper(async (req, res) => {
    return await createRecord(Student, req.body, "student", validateStudentData);
});

// Get All Students
export const getAllStudents = controllerWrapper(async (req, res) => {
    return await getAllRecords(
        Student,
        "students",
        [
            "userId",
            "schoolId",
            {
                path: "intakeCourseId",
                populate: [{ path: "intakeId" }, { path: "courseId" }]
            }
        ]
    );
});

// Get Student by ID
export const getStudentById = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await getRecordById(
        Student,
        id,
        "student",
        [
            "userId",
            "schoolId",
            {
                path: "intakeCourseId",
                populate: [{ path: "intakeId" }, { path: "courseId" }]
            }
        ]
    );
});

// Update Student
export const updateStudent = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await updateRecord(Student, id, req.body, "student", validateStudentData);
});

// Delete Student
export const deleteStudent = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await deleteRecord(Student, id, "student");
});

// Get Students by School ID
export const getStudentsBySchoolId = controllerWrapper(async (req, res) => {
    const { schoolId } = req.params;
    return await getAllRecords(
        Student,
        "students",
        [
            "userId",
            "schoolId",
            {
                path: "intakeCourseId",
                populate: [{ path: "intakeId" }, { path: "courseId" }]
            }
        ],
        { schoolId }
    );
});

// Get Students by IntakeCourse ID
export const getStudentsByIntakeCourseId = controllerWrapper(async (req, res) => {
    const { intakeCourseId } = req.params;
    return await getAllRecords(
        Student,
        "students",
        [
            "userId",
            "schoolId",
            {
                path: "intakeCourseId",
                populate: [{ path: "intakeId" }, { path: "courseId" }]
            }
        ],
        { intakeCourseId }
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
        [
            "userId",
            "schoolId",
            {
                path: "intakeCourseId",
                populate: [{ path: "intakeId" }, { path: "courseId" }]
            }
        ],
        { year: Number(year) }
    );
});