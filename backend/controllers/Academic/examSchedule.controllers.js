import ExamSchedule from "../../models/Academic/examSchedule.model.js";
import Room from "../../models/Academic/room.model.js";
import Module from "../../models/Academic/module.model.js";
import Lecturer from "../../models/Academic/lecturer.model.js";
import Intake from "../../models/Academic/intake.model.js";
import IntakeCourse from "../../models/Academic/intakeCourse.model.js";
import Course from "../../models/Academic/course.model.js";
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

// Custom validation function for exam schedule data
const validateExamScheduleData = async (data) => {
    const {
        intakeCourseId,
        courseId,
        moduleId,
        examDate,
        examTime,
        roomId,
        invigilators,
        durationMinute,
        schoolId
    } = data;

    // Check required fields
    if (
        !intakeCourseId ||
        !courseId ||
        !moduleId ||
        !examDate ||
        !examTime ||
        !roomId ||
        !invigilators ||
        !Array.isArray(invigilators) ||
        invigilators.length === 0 ||
        !durationMinute ||
        !schoolId
    ) {
        return {
            isValid: false,
            message: "Please provide all required fields (intakeCourseId, courseId, moduleId, examDate, examTime, roomId, invigilators, durationMinute, schoolId)"
        };
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(examDate)) {
        return {
            isValid: false,
            message: "examDate must be in YYYY-MM-DD format"
        };
    }

    // Validate time format
    if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(examTime)) {
        return {
            isValid: false,
            message: "examTime must be in HH:mm format"
        };
    }

    // Validate durationMinute
    if (typeof durationMinute !== "number" || durationMinute < 1) {
        return {
            isValid: false,
            message: "durationMinute must be a positive number"
        };
    }

    // Validate references exist
    const referenceValidation = await validateMultipleReferences({
        intakeCourseId: { id: intakeCourseId, Model: IntakeCourse },
        courseId: { id: courseId, Model: Course },
        moduleId: { id: moduleId, Model: Module },
        roomId: { id: roomId, Model: Room },
        schoolId: { id: schoolId, Model: School },
        // For invigilators, check each ID
    });

    if (referenceValidation) {
        return {
            isValid: false,
            message: referenceValidation.message
        };
    }

    // Validate invigilators array
    for (const invigilatorId of invigilators) {
        const invigilatorValidation = await validateReferenceExists(invigilatorId, Lecturer, "invigilatorId");
        if (invigilatorValidation) {
            return {
                isValid: false,
                message: `Invalid invigilatorId: ${invigilatorValidation.message}`
            };
        }
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
// Delete All ExamSchedules
export const deleteAllExamSchedules = controllerWrapper(async (req, res) => {
    return await deleteAllRecords(ExamSchedule, "examSchedules");
});

export const getExamSchedulesBySchool = controllerWrapper(async (req, res) => {
    const { schoolId } = req.params;
    return await getAllRecords(
        ExamSchedule,
        "examSchedules",
        ["moduleId", "schoolId"],
        { schoolId }
    );
});