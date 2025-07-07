import Course from '../../models/Academic/course.model.js';
import Module from '../../models/Academic/module.model.js';
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

// Custom validation function for course data
const validateCourseData = async (data) => {
    const { CourseName, Duration, ModuleID } = data;

    // Check required fields
    if (!CourseName || !Duration || !ModuleID) {
        return {
            isValid: false,
            message: "Please provide all required fields (CourseName, Duration, ModuleID)"
        };
    }

    // Validate references exist
    const referenceValidation = await validateMultipleReferences({
        moduleID: { id: ModuleID, Model: Module }
    });

    if (referenceValidation) {
        return {
            isValid: false,
            message: referenceValidation.message
        };
    }

    return { isValid: true };
};

// Create Course
export const createCourse = controllerWrapper(async (req, res) => {
    return await createRecord(
        Course,
        req.body,
        "course",
        validateCourseData
    );
});

// Get All Courses
export const getCourses = controllerWrapper(async (req, res) => {
    return await getAllRecords(
        Course,
        "courses",
        ['ModuleID']
    );
});

// Get Course by ID
export const getCourseById = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await getRecordById(
        Course,
        id,
        "course",
        ['ModuleID']
    );
});

// Update Course
export const updateCourse = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await updateRecord(
        Course,
        id,
        req.body,
        "course",
        validateCourseData
    );
});

// Delete Course
export const deleteCourse = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await deleteRecord(Course, id, "course");
});