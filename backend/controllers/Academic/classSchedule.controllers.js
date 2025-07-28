import ClassSchedule from '../../models/Academic/classSchedule.model.js';
import Room from '../../models/Academic/room.model.js';
import Module from '../../models/Academic/module.model.js';
import Lecturer from '../../models/Academic/lecturer.model.js';
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
import IntakeCourse from '../../models/Academic/intakeCourse.model.js';

// Custom validation function for class schedule data
const validateClassScheduleData = async (data) => {
    const { roomId, moduleId, lecturerId, dayOfWeek, startTime, endTime, intakeCourseId } = data;

    // Check required fields
    if (!roomId || !moduleId || !lecturerId || !dayOfWeek || !startTime || !endTime || !intakeCourseId) {
        return {
            isValid: false,
            message: "Please provide all required fields (roomId, moduleId, lecturerId, dayOfWeek, startTime, endTime, intakeCourseId)"
        };
    }

    // Validate references exist
    const referenceValidation = await validateMultipleReferences({
        roomId: { id: roomId, Model: Room },
        moduleId: { id: moduleId, Model: Module },
        lecturerId: { id: lecturerId, Model: Lecturer },
        intakeCourseId: { id: intakeCourseId, Model: IntakeCourse }
    });

    if (referenceValidation) {
        return {
            isValid: false,
            message: referenceValidation.message
        };
    }

    return { isValid: true };
};

// Create Class Schedule
export const createClassSchedule = controllerWrapper(async (req, res) => {
    return await createRecord(
        ClassSchedule,
        req.body,
        "classSchedule",
        validateClassScheduleData
    );
});

// Get All Class Schedules
export const getClassSchedules = controllerWrapper(async (req, res) => {
    return await getAllRecords(
        ClassSchedule,
        "classSchedules",
        ['roomId', 'moduleId',
            {
                path: "lecturerId",
                populate: [{ path: "userId" }]
            }
            , 'intakeCourseId']
    );
});

// Get Class Schedule by ID
export const getClassScheduleById = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await getRecordById(
        ClassSchedule,
        id,
        "classSchedules",
        ['roomId', 'moduleId', {
            path: "lecturerId",
            populate: [{ path: "userId" }]
        }, 'intakeCourseId']
    );
});

// Update Class Schedule
export const updateClassSchedule = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await updateRecord(
        ClassSchedule,
        id,
        req.body,
        "classSchedules",
        validateClassScheduleData
    );
});

// Delete Class Schedule
export const deleteClassSchedule = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await deleteRecord(ClassSchedule, id, "class schedule");
});
// Delete All ClassSchedules
export const deleteAllClassSchedules = controllerWrapper(async (req, res) => {
    return await deleteAllRecords(ClassSchedule, "classSchedules");
});

export const getClassSchedulesBySchool = controllerWrapper(async (req, res) => {
    const { schoolId } = req.params;
    return await getAllRecords(
        ClassSchedule,
        "classSchedules",
        ["moduleId", "roomId", "schoolId",
            {
                path: "lecturerId",
                populate: [{ path: "userId" }]
            },
        ],
        { schoolId }
    );
});