import ExamSchedule from "../../models/Academic/examSchedule.model.js";
import Room from "../../models/Academic/room.model.js";
import Module from "../../models/Academic/module.model.js";
import Lecturer from "../../models/Academic/lecturer.model.js";
import IntakeCourse from "../../models/Academic/intakeCourse.model.js";
import Course from "../../models/Academic/course.model.js";

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

// Custom validation function for exam schedule data
const validateExamScheduleData = async (data) => {
    const { RoomID, ModuleID, invigilators, examDate, examTime, intakeCourseID, courseId, durationMinute, schoolID } = data;

    // Check required fields
    if (!RoomID || !ModuleID || !examDate || !examTime || !intakeCourseID || !CourseID || !durationMinute || !schoolID) {
        return {
            isValid: false,
            message: "Please provide all required fields (RoomID, ModuleID, invigilators, examDate, examTime, intakeCourseID, courseId, durationMinute, schoolID )"
        };
    }

    // Validate references exist
    const referenceValidation = await validateMultipleReferences({
        RoomID: { id: RoomID, Model: Room },
        ModuleID: { id: ModuleID, Model: Module },
        intakeCourseID: { id: intakeCourseID, Model: IntakeCourse },
        CourseID: { id: CourseID, Model: Course }
    });

    if (referenceValidation) {
        return {
            isValid: false,
            message: referenceValidation.message
        };
    }

    return { isValid: true };
};

// Create Exam Schedule
export const createExamSchedule = controllerWrapper(async (req, res) => {
    return await createRecord(
        ExamSchedule,
        req.body,
        "exam schedule",
        validateExamScheduleData
    );
});

// Get All Exam Schedules
export const getExamSchedules = controllerWrapper(async (req, res) => {
    return await getAllRecords(
        ExamSchedule,
        "exam schedules",
        ['RoomID', 'ModuleID', 'CourseID', 'intakeCourseID']
    );
});

// Get Exam Schedule by ID
export const getExamScheduleById = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await getRecordById(
        ExamSchedule,
        id,
        "exam schedule",
        ['RoomID', 'ModuleID', 'CourseID', 'intakeCourseID']
    );
});

// Update Exam Schedule
export const updateExamSchedule = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await updateRecord(
        ExamSchedule,
        id,
        req.body,
        "exam schedule",
        validateExamScheduleData
    );
});

// Delete Exam Schedule
export const deleteExamSchedule = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await deleteRecord(ExamSchedule, id, "exam schedule");
});