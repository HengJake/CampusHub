// Programmer Name : Ritchie Boon Win Yew, Backend Developer
// Program Name: bugReport.controllers.js
// Description: Bug report management controller handling software issue reporting, bug tracking, and resolution workflow
// First Written on: July 17, 2024
// Edited on: Friday, July 19, 2024

import BugReport from '../../models/Service/bugReport.model.js';
import {
    createRecord,
    getAllRecords,
    getRecordById,
    updateRecord,
    deleteRecord,
    controllerWrapper
} from "../../utils/reusable.js";

const validateBugReportData = async (data) => {
    const { userId, image, consoleLogMessage, errorFile } = data;

    // Check required fields
    if (!userId) {
        return {
            isValid: false,
            message: "User ID is required"
        };
    }

    if (!image) {
        return {
            isValid: false,
            message: "Screenshot image is required"
        };
    }

    if (!consoleLogMessage) {
        return {
            isValid: false,
            message: "Console log message is required"
        };
    }

    if (!errorFile) {
        return {
            isValid: false,
            message: "Error file path is required"
        };
    }

    return { isValid: true };
};

export const createBugReport = controllerWrapper(async (req, res) => {
    return await createRecord(
        BugReport,
        req.body,
        "bug report",
        validateBugReportData
    );
});

export const getAllBugReports = controllerWrapper(async (req, res) => {
    return await getAllRecords(BugReport, "bug reports", ["userId"]);
});

export const getBugReportById = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await getRecordById(BugReport, id, "bug report", ["userId"]);
});

export const updateBugReport = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await updateRecord(BugReport, id, req.body, "bug report", validateBugReportData);
});

export const deleteBugReport = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await deleteRecord(BugReport, id, "bug report");
});

export const getBugReportsBySchoolId = controllerWrapper(async (req, res) => {
    const { schoolId } = req.params;
    return await getAllRecords(
        BugReport,
        "bug reports",
        ["userId"],
        { schoolId }
    );
});

export const getBugReportsByUserId = controllerWrapper(async (req, res) => {
    const { userId } = req.params;
    return await getAllRecords(
        BugReport,
        "bug reports",
        ["userId"],
        { userId }
    );
});

export const getBugReportsBySchoolAndUser = controllerWrapper(async (req, res) => {
    const { schoolId, userId } = req.params;
    return await getAllRecords(
        BugReport,
        "bug reports",
        ["userId"],
        { schoolId, userId }
    );
});
