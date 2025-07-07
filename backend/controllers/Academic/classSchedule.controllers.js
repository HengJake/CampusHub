import ClassSchedule from '../../models/Academic/classSchedule.model.js';
import Room from '../../models/Academic/room.model.js';
import Module from '../../models/Academic/module.model.js';
import Lecturer from '../../models/Academic/lecturer.model.js';
import Intake from '../../models/Academic/intake.model.js';
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

// Custom validation function for class schedule data
const validateClassScheduleData = async (data) => {
    const { RoomID, ModuleID, LecturerID, DayOfWeek, StartTime, EndTime, IntakeID } = data;

    // Check required fields
    if (!RoomID || !ModuleID || !LecturerID || !DayOfWeek || !StartTime || !EndTime || !IntakeID) {
        return {
            isValid: false,
            message: "Please provide all required fields (RoomID, ModuleID, LecturerID, DayOfWeek, StartTime, EndTime, IntakeID)"
        };
    }

    // Validate references exist
    const referenceValidation = await validateMultipleReferences({
        roomID: { id: RoomID, Model: Room },
        moduleID: { id: ModuleID, Model: Module },
        lecturerID: { id: LecturerID, Model: Lecturer },
        intakeID: { id: IntakeID, Model: Intake }
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
        "class schedule",
        validateClassScheduleData
    );
});

// Get All Class Schedules
export const getClassSchedules = controllerWrapper(async (req, res) => {
    return await getAllRecords(
        ClassSchedule,
        "class schedules",
        ['RoomID', 'ModuleID', 'LecturerID', 'IntakeID']
    );
});

// Get Class Schedule by ID
export const getClassScheduleById = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await getRecordById(
        ClassSchedule,
        id,
        "class schedule",
        ['RoomID', 'ModuleID', 'LecturerID', 'IntakeID']
    );
});

// Update Class Schedule
export const updateClassSchedule = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await updateRecord(
        ClassSchedule,
        id,
        req.body,
        "class schedule",
        validateClassScheduleData
    );
});

// Delete Class Schedule
export const deleteClassSchedule = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await deleteRecord(ClassSchedule, id, "class schedule");
});