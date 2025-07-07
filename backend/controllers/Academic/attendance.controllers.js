import Attendance from "../../models/Academic/attendance.model.js";
import Student from "../../models/Academic/student.model.js";
import ClassSchedule from "../../models/Academic/classSchedule.model.js";
import {
    createRecord,
    getAllRecords,
    getRecordById,
    updateRecord,
    deleteRecord,
    validateMultipleReferences,
    controllerWrapper
} from "../../utils/reusable.js";

const validateAttendanceData = async (data) => {
    const { StudentID, ScheduleID, Status, Date } = data;

    // Check required fields
    if (!StudentID) {
        return {
            isValid: false,
            message: "StudentID is required"
        };
    }
    if (!ScheduleID) {
        return {
            isValid: false,
            message: "ScheduleID is required"
        };
    }
    if (!Status) {
        return {
            isValid: false,
            message: "Status is required"
        };
    }
    if (!Date) {
        return {
            isValid: false,
            message: "Date is required"
        };
    }

    // Validate Status enum values
    const validStatuses = ["present", "absent", "late"];
    if (!validStatuses.includes(Status)) {
        return {
            isValid: false,
            message: "Status must be one of: present, absent, late"
        };
    }

    // Validate Date format
    const dateObj = new Date(Date);
    if (isNaN(dateObj.getTime())) {
        return {
            isValid: false,
            message: "Invalid date format"
        };
    }

    // Validate references exist
    const referenceValidation = await validateMultipleReferences({
        StudentID: { id: StudentID, Model: Student },
        ScheduleID: { id: ScheduleID, Model: ClassSchedule }
    });

    if (referenceValidation) {
        return {
            isValid: false,
            message: referenceValidation.message
        };
    }

    return { isValid: true };
};

export const createAttendance = controllerWrapper(async (req, res) => {
    return await createRecord(
        Attendance,
        req.body,
        "attendance",
        validateAttendanceData
    );
});

export const getAllAttendance = controllerWrapper(async (req, res) => {
    return await getAllRecords(Attendance, "attendance", ["StudentID", "ScheduleID"]);
});

export const getAttendanceById = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await getRecordById(Attendance, id, "attendance", ["StudentID", "ScheduleID"]);
});

export const updateAttendance = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await updateRecord(Attendance, id, req.body, "attendance", validateAttendanceData);
});

export const deleteAttendance = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await deleteRecord(Attendance, id, "attendance");
});