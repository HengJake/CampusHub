import Attendance from "../../models/Academic/attendance.model.js";
import Student from "../../models/Academic/student.model.js";
import ClassSchedule from "../../models/Academic/classSchedule.model.js";
import School from "../../models/Billing/school.model.js";
import {
    createRecord,
    getAllRecords,
    getRecordById,
    updateRecord,
    deleteRecord,
    validateMultipleReferences,
    controllerWrapper,
    deleteAllRecords
} from "../../utils/reusable.js";

const validateAttendanceData = async (data) => {
    const { studentId, scheduleId, status, date, schoolId } = data;

    // Check required fields
    if (!studentId) {
        return {
            isValid: false,
            message: "studentId is required"
        };
    }
    if (!scheduleId) {
        return {
            isValid: false,
            message: "scheduleId is required"
        };
    }
    if (!status) {
        return {
            isValid: false,
            message: "status is required"
        };
    }
    if (!date) {
        return {
            isValid: false,
            message: "date is required"
        };
    }
    if (!schoolId) {
        return {
            isValid: false,
            message: "schoolId is required"
        };
    }

    // Validate status enum values
    const validStatuses = ["present", "absent", "late"];
    if (!validStatuses.includes(status)) {
        return {
            isValid: false,
            message: "status must be one of: present, absent, late"
        };
    }

    // Validate date format
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
        return {
            isValid: false,
            message: "Invalid date format"
        };
    }

    // Validate references exist
    const referenceValidation = await validateMultipleReferences({
        studentId: { id: studentId, Model: Student },
        scheduleId: { id: scheduleId, Model: ClassSchedule },
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

export const createAttendance = controllerWrapper(async (req, res) => {
    return await createRecord(
        Attendance,
        req.body,
        "attendance",
        validateAttendanceData
    );
});

export const getAllAttendance = controllerWrapper(async (req, res) => {
    return await getAllRecords(Attendance, "attendance", ["studentId", "scheduleId", "schoolId"]);
});

export const getAttendanceById = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await getRecordById(Attendance, id, "attendance", ["studentId", "scheduleId", "schoolId"]);
});

export const getAttendanceBySchoolId = controllerWrapper(async (req, res) => {
    const { schoolId } = req.params;
    if (!schoolId) {
        return {
            success: false,
            message: "schoolId is required",
            statusCode: 400
        };
    }
    // Pass filter to getAllRecords
    return await getAllRecords(
        Attendance,
        "attendance",
        ["studentId", "scheduleId", "schoolId"],
        { schoolId }
    );
});

export const updateAttendance = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await updateRecord(Attendance, id, req.body, "attendance", validateAttendanceData);
});

export const deleteAttendance = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await deleteRecord(Attendance, id, "attendance");
});
// Delete All Attendances
export const deleteAllAttendances = controllerWrapper(async (req, res) => {
    return await deleteAllRecords(Attendance, "attendances");
});