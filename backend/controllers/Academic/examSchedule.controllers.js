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

// Helper function to check for time conflicts
const checkTimeConflict = (start1, end1, start2, end2) => {
    // Convert time strings to minutes for easier comparison
    const timeToMinutes = (timeStr) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    };

    const start1Minutes = timeToMinutes(start1);
    const end1Minutes = timeToMinutes(end1);
    const start2Minutes = timeToMinutes(start2);
    const end2Minutes = timeToMinutes(end2);

    // Check if times overlap
    return (start1Minutes < end2Minutes && end1Minutes > start2Minutes);
};

// Function to calculate end time from start time and duration
const calculateEndTime = (startTime, durationMinutes) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
};

// Function to check for room and time conflicts for exams
const checkExamRoomTimeConflict = async (roomId, examDate, examTime, durationMinute, excludeId = null) => {
    try {
        // Build query to find existing exams with the same room and date
        const query = {
            roomId: roomId,
            examDate: examDate
        };

        // Exclude current record if updating
        if (excludeId) {
            query._id = { $ne: excludeId };
        }

        const existingExams = await ExamSchedule.find(query);

        // Calculate end time for the new exam
        const newExamEndTime = calculateEndTime(examTime, durationMinute);

        // Check for time conflicts
        for (const exam of existingExams) {
            const existingExamEndTime = calculateEndTime(exam.examTime, exam.durationMinute);

            if (checkTimeConflict(examTime, newExamEndTime, exam.examTime, existingExamEndTime)) {
                return {
                    hasConflict: true,
                    conflictingExam: exam,
                    message: `Room conflict: Another exam is scheduled in this room on ${examDate} from ${exam.examTime} to ${existingExamEndTime}`
                };
            }
        }

        return { hasConflict: false };
    } catch (error) {
        console.error('Error checking exam room time conflict:', error);
        return {
            hasConflict: false,
            error: error.message
        };
    }
};

// Custom validation function for exam schedule data
const validateExamScheduleData = async (data) => {
    const {
        intakeCourseId,
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
            message: "Please provide all required fields (intakeCourseId, moduleId, examDate, examTime, roomId, invigilators, durationMinute, schoolId)"
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

    // Validate that exam date is not in the past
    const examDateObj = new Date(examDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (examDateObj < today) {
        return {
            isValid: false,
            message: "examDate cannot be in the past"
        };
    }

    // Validate references exist
    const referenceValidation = await validateMultipleReferences({
        intakeCourseId: { id: intakeCourseId, Model: IntakeCourse },
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

    // Check for room and time conflicts
    const conflictCheck = await checkExamRoomTimeConflict(roomId, examDate, examTime, durationMinute);
    if (conflictCheck.hasConflict) {
        return {
            isValid: false,
            message: conflictCheck.message
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
        ['roomId', 'moduleId', 'semesterId', 'intakeCourseId']
    );
});

// Get Exam Schedule by ID
export const getExamScheduleById = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await getRecordById(
        ExamSchedule,
        id,
        "exam schedule",
        ['roomId', 'moduleId', 'semesterId', 'intakeCourseId']
    );
});

// Update Exam Schedule
export const updateExamSchedule = controllerWrapper(async (req, res) => {
    const { id } = req.params;

    // Custom validation function for updates that excludes the current record
    const validateExamScheduleDataForUpdate = async (data) => {
        const validation = await validateExamScheduleData(data);
        if (!validation.isValid) {
            return validation;
        }

        // Check for conflicts excluding the current record
        const conflictCheck = await checkExamRoomTimeConflict(
            data.roomId,
            data.examDate,
            data.examTime,
            data.durationMinute,
            id
        );

        if (conflictCheck.hasConflict) {
            return {
                isValid: false,
                message: conflictCheck.message
            };
        }

        return { isValid: true };
    };

    return await updateRecord(
        ExamSchedule,
        id,
        req.body,
        "examSchedules",
        validateExamScheduleDataForUpdate
    );
});

// Delete Exam Schedule
export const deleteExamSchedule = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await deleteRecord(ExamSchedule, id, "examSchedules");
});

// Delete All ExamSchedules
export const deleteAllExamSchedules = controllerWrapper(async (req, res) => {
    return await deleteAllRecords(ExamSchedule, "examSchedules");
});

export const getExamSchedulesBySchoolId = controllerWrapper(async (req, res) => {
    const { schoolId } = req.params;
    return await getAllRecords(
        ExamSchedule,
        "examSchedules",
        [
            "moduleId",
            "schoolId",
            "roomId",
            'semesterId',
            {
                path: 'intakeCourseId',
                populate: [
                    { path: 'intakeId' },
                    { path: 'courseId' }
                ]
            }
        ],
        { schoolId }
    );
});