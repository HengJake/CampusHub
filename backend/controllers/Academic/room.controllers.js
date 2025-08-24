// Programmer Name : Heng Jun Kai, Project Manager, Leader Full Stack developer
// Program Name: room.controllers.js
// Description: Room management controller handling CRUD operations for classroom facilities, availability, and scheduling management
// First Written on: July 16, 2024
// Edited on: Friday, July 19, 2024

import Room from '../../models/Academic/room.model.js';
import ClassSchedule from '../../models/Academic/classSchedule.model.js';
import ExamSchedule from '../../models/Academic/examSchedule.model.js';
import {
    createRecord,
    getAllRecords,
    getRecordById,
    updateRecord,
    deleteRecord,
    controllerWrapper,
    deleteAllRecords
} from "../../utils/reusable.js";

const validateRoomData = async (data) => {
    const { capacity } = data;

    // Check required fields
    if (!capacity) {
        return {
            isValid: false,
            message: "Capacity is required"
        };
    }

    // Validate Capacity is a positive number
    if (typeof capacity !== 'number' || capacity <= 0) {
        return {
            isValid: false,
            message: "Capacity must be a positive number"
        };
    }

    return { isValid: true };
};

export const createRoom = controllerWrapper(async (req, res) => {
    return await createRecord(
        Room,
        req.body,
        "room",
        validateRoomData
    );
});

export const getAllRooms = controllerWrapper(async (req, res) => {
    return await getAllRecords(Room, "room");
});

export const getRoomById = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await getRecordById(Room, id, "room");
});

export const updateRoom = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await updateRecord(Room, id, req.body, "room", validateRoomData);
});

export const deleteRoom = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await deleteRecord(Room, id, "room");
});
// Delete All Rooms
export const deleteAllRooms = controllerWrapper(async (req, res) => {
    return await deleteAllRecords(Room, "rooms");
});

export const getRoomsBySchoolId = controllerWrapper(async (req, res) => {
    const { schoolId } = req.params;
    return await getAllRecords(
        Room,
        "rooms",
        ["schoolId"],
        { schoolId }
    );
});

// Function to check time conflicts
const checkTimeConflict = (start1, end1, start2, end2) => {

    const timeToMinutes = (timeStr) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    };

    const start1Minutes = timeToMinutes(start1);
    const end1Minutes = timeToMinutes(end1);
    const start2Minutes = timeToMinutes(start2);
    const end2Minutes = timeToMinutes(end2);

    return (start1Minutes < end2Minutes && end1Minutes > start2Minutes);
};

// Function to check room conflicts for a specific date and time
const checkRoomConflicts = async (roomId, date, startTime, endTime, excludeId = null) => {
    try {
        const conflicts = [];

        // Check class schedule conflicts
        const classSchedules = await ClassSchedule.find({ roomId });

        for (const schedule of classSchedules) {
            // Skip if this is the record we're updating
            if (excludeId && schedule._id.toString() === excludeId) continue;

            // Check if the schedule falls on the same day of week
            const scheduleDate = new Date(date);
            const scheduleDay = scheduleDate.toLocaleDateString('en-US', { weekday: 'long' });

            if (schedule.dayOfWeek === scheduleDay) {
                if (checkTimeConflict(startTime, endTime, schedule.startTime, schedule.endTime)) {
                    conflicts.push({
                        type: 'class',
                        schedule: schedule,
                        message: `Class conflict: ${schedule.moduleId?.moduleName || 'Unknown module'} on ${schedule.dayOfWeek} from ${schedule.startTime} to ${schedule.endTime}`
                    });
                }
            }
        }

        // Check exam schedule conflicts
        const examSchedules = await ExamSchedule.find({ roomId });

        for (const exam of examSchedules) {
            // Skip if this is the record we're updating
            if (excludeId && exam._id.toString() === excludeId) continue;

            // Check if exam is on the same date
            if (exam.examDate === date) {
                const examEndTime = calculateEndTime(exam.examTime, exam.durationMinute);
                if (checkTimeConflict(startTime, endTime, exam.examTime, examEndTime)) {
                    conflicts.push({
                        type: 'exam',
                        schedule: exam,
                        message: `Exam conflict: ${exam.moduleId?.moduleName || 'Unknown module'} on ${exam.examDate} from ${exam.examTime} to ${examEndTime}`
                    });
                }
            }
        }

        return {
            hasConflicts: conflicts.length > 0,
            conflicts: conflicts
        };
    } catch (error) {
        console.error('Error checking room conflicts:', error);
        return {
            hasConflicts: false,
            error: error.message
        };
    }
};

// Helper function to calculate end time from start time and duration
const calculateEndTime = (startTime, durationMinutes) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
};

export const checkRoomAvailability = controllerWrapper(async (req, res) => {
    try {
        const { roomId, date, startTime, endTime, excludeId } = req.body;

        if (!roomId || !date || !startTime || !endTime) {
            return {
                success: false,
                message: "roomId, date, startTime, and endTime are required",
                statusCode: 400
            };
        }

        const conflictResult = await checkRoomConflicts(roomId, date, startTime, endTime, excludeId);

        return {
            success: true,
            data: conflictResult,
            message: conflictResult.hasConflicts
                ? "Room conflicts found"
                : "No conflicts found",
            statusCode: 200
        };
    } catch (error) {
        console.error("Error checking room availability:", error.message);
        return {
            success: false,
            message: "Server error - checkRoomAvailability method",
            statusCode: 500
        };
    }
});