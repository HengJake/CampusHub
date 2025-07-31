import ClassSchedule from '../../models/Academic/classSchedule.model.js';
import Room from '../../models/Academic/room.model.js';
import Module from '../../models/Academic/module.model.js';
import Lecturer from '../../models/Academic/lecturer.model.js';
import IntakeCourse from '../../models/Academic/intakeCourse.model.js';
import Semester from '../../models/Academic/semester.model.js';
import School from '../../models/Billing/school.model.js';
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

// Custom validation function for class schedule data
const validateClassScheduleData = async (data) => {
    const { roomId, moduleId, lecturerId, dayOfWeek, startTime, endTime, intakeCourseId, semesterId, schoolId, moduleStartDate, moduleEndDate } = data;

    // Check required fields
    if (!roomId || !moduleId || !lecturerId || !dayOfWeek || !startTime || !endTime || !intakeCourseId || !semesterId || !schoolId || !moduleStartDate || !moduleEndDate) {
        return {
            isValid: false,
            message: "Please provide all required fields (roomId, moduleId, lecturerId, dayOfWeek, startTime, endTime, intakeCourseId, semesterId, schoolId, moduleStartDate, moduleEndDate)"
        };
    }

    // Validate time format
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(startTime)) {
        return {
            isValid: false,
            message: "startTime must be in HH:MM format (24-hour)"
        };
    }
    if (!timeRegex.test(endTime)) {
        return {
            isValid: false,
            message: "endTime must be in HH:MM format (24-hour)"
        };
    }

    // Validate dayOfWeek enum
    const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    if (!validDays.includes(dayOfWeek)) {
        return {
            isValid: false,
            message: "dayOfWeek must be one of: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday"
        };
    }

    // Validate dates
    const startDate = new Date(moduleStartDate);
    const endDate = new Date(moduleEndDate);

    if (isNaN(startDate.getTime())) {
        return {
            isValid: false,
            message: "moduleStartDate must be a valid date"
        };
    }

    if (isNaN(endDate.getTime())) {
        return {
            isValid: false,
            message: "moduleEndDate must be a valid date"
        };
    }

    if (endDate <= startDate) {
        return {
            isValid: false,
            message: "moduleEndDate must be after moduleStartDate"
        };
    }

    // Validate references exist
    const referenceValidation = await validateMultipleReferences({
        roomId: { id: roomId, Model: Room },
        moduleId: { id: moduleId, Model: Module },
        lecturerId: { id: lecturerId, Model: Lecturer },
        intakeCourseId: { id: intakeCourseId, Model: IntakeCourse },
        semesterId: { id: semesterId, Model: Semester },
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
        ['roomId', 'moduleId', 'intakeCourseId', 'semesterId', 'schoolId', {
            path: "lecturerId",
            populate: [{ path: "userId" }]
        }]
    );
});

// Get Class Schedule by ID
export const getClassScheduleById = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await getRecordById(
        ClassSchedule,
        id,
        "classSchedule",
        ['roomId', 'moduleId', 'semesterId', 'schoolId', {
            path: 'intakeCourseId',
            populate: { path: ["intakeId", "courseId"] }
        }, {
                path: "lecturerId",
                populate: [{ path: "userId" }]
            }]
    );
});

// Update Class Schedule
export const updateClassSchedule = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await updateRecord(
        ClassSchedule,
        id,
        req.body,
        "classSchedule",
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
        ['roomId', 'moduleId', 'semesterId', 'schoolId', {
            path: 'intakeCourseId',
            populate: { path: ["intakeId", "courseId"] }
        }, {
                path: "lecturerId",
                populate: { path: "userId" }
            }],
        { schoolId }
    );
});