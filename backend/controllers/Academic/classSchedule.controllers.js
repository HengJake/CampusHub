import ClassSchedule from '../../models/Academic/classSchedule.model.js';
import Room from '../../models/Academic/room.model.js';
import Module from '../../models/Academic/module.model.js';
import Lecturer from '../../models/Academic/lecturer.model.js';
import IntakeCourse from '../../models/Academic/intakeCourse.model.js';
import Semester from '../../models/Academic/semester.model.js';
import School from '../../models/Billing/school.model.js';
import Student from '../../models/Academic/student.model.js';
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

// Function to check for room and time conflicts
const checkRoomTimeConflict = async (roomId, dayOfWeek, startTime, endTime, semesterId, excludeId = null) => {
    try {
        // Build query to find existing schedules with the same room and day
        const query = {
            roomId: roomId,
            dayOfWeek: dayOfWeek,
            semesterId: semesterId
        };

        // Exclude current record if updating
        if (excludeId) {
            query._id = { $ne: excludeId };
        }

        const existingSchedules = await ClassSchedule.find(query);

        // Check for time conflicts
        for (const schedule of existingSchedules) {
            if (checkTimeConflict(startTime, endTime, schedule.startTime, schedule.endTime)) {
                return {
                    hasConflict: true,
                    conflictingSchedule: schedule,
                    message: `Room conflict: Another class is scheduled in this room on ${dayOfWeek} from ${schedule.startTime} to ${schedule.endTime}`
                };
            }
        }

        return { hasConflict: false };
    } catch (error) {
        console.error('Error checking room time conflict:', error);
        return {
            hasConflict: false,
            error: error.message
        };
    }
};

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

    // Validate that end time is after start time
    const startMinutes = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
    const endMinutes = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]);

    if (endMinutes <= startMinutes) {
        return {
            isValid: false,
            message: "endTime must be after startTime"
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

    // Check for room and time conflicts
    const conflictCheck = await checkRoomTimeConflict(roomId, dayOfWeek, startTime, endTime, semesterId);
    if (conflictCheck.hasConflict) {
        return {
            isValid: false,
            message: conflictCheck.message
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

    // Custom validation function for updates that excludes the current record
    const validateClassScheduleDataForUpdate = async (data) => {
        const validation = await validateClassScheduleData(data);
        if (!validation.isValid) {
            return validation;
        }

        // Check for conflicts excluding the current record
        const conflictCheck = await checkRoomTimeConflict(
            data.roomId,
            data.dayOfWeek,
            data.startTime,
            data.endTime,
            data.semesterId,
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
        ClassSchedule,
        id,
        req.body,
        "classSchedule",
        validateClassScheduleDataForUpdate
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

export const getClassSchedulesBySchoolId = controllerWrapper(async (req, res) => {
    const { schoolId } = req.params;
    return await getAllRecords(
        ClassSchedule,
        "classSchedules",
        ['roomId', 'moduleId', 'semesterId', 'schoolId', {
            path: 'intakeCourseId',
            populate: ["intakeId", "courseId"]
        }, {
                path: "lecturerId",
                populate: { path: "userId" }
            }],
        { schoolId }
    );
});

// Get Class Schedules by Student ID
export const getClassSchedulesByStudentId = controllerWrapper(async (req, res) => {
    const { studentId } = req.params;

    if (!studentId) {
        return {
            success: false,
            message: "studentId is required",
            statusCode: 400
        };
    }

    try {
        // First, get the student to find their intakeCourseId
        const student = await Student.findById(studentId).populate('intakeCourseId');

        if (!student) {
            return {
                success: false,
                message: "Student not found",
                statusCode: 404
            };
        }

        // Get class schedules that match the student's intake course
        const classSchedules = await ClassSchedule.find({
            intakeCourseId: student.intakeCourseId._id
        }).populate([
            'roomId',
            'moduleId',
            'semesterId',
            'schoolId',
            {
                path: 'intakeCourseId',
                populate: ["intakeId", "courseId"]
            },
            {
                path: "lecturerId",
                populate: { path: "userId" }
            }
        ]);


        return {
            success: true,
            data: classSchedules,
            message: "Class schedules retrieved successfully",
            statusCode: 200
        };
    } catch (error) {
        return {
            success: false,
            message: error.message || "Failed to retrieve class schedules",
            statusCode: 500
        };
    }
});