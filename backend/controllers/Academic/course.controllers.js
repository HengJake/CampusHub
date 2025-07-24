import Course from '../../models/Academic/course.model.js';
import Module from '../../models/Academic/module.model.js';
import Department from '../../models/Academic/department.model.js';

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

// Custom validation function for course data
const validateCourseData = async (data) => {
    // CORRECT - Using camelCase
    const { courseName, duration, departmentId } = data;

    // Check required fields
    if (!courseName || !duration || !departmentId) {
        return {
            isValid: false,
            message: "Please provide all required fields (CourseName, Duration)"
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
        ["schoolId"]
    );
});

// Get Course by ID
export const getCourseById = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await getRecordById(
        Course,
        id,
        "course",
        ["schoolId"]
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

// Delete All Courses
export const deleteAllCourses = controllerWrapper(async (req, res) => {
    return await deleteAllRecords(Course, "courses");
});

export const getCoursesBySchool = controllerWrapper(async (req, res) => {
    const { schoolId } = req.params;
    return await getAllRecords(
        Course,
        "courses",
        ["departmentId", "schoolId"],
        { schoolId }
    );
});