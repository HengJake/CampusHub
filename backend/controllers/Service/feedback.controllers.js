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
import Feedback from "../../models/Service/feedback.model.js";
import Student from "../../models/Academic/student.model.js";
import School from "../../models/Billing/school.model.js";

const validateFeedbackData = async (data) => {
    const { studentId, schoolId, message, feedbackType, status, priority } = data;

    // Check required fields
    if (!studentId) return { isValid: false, message: "studentId is required" };
    if (!schoolId) return { isValid: false, message: "schoolId is required" };
    if (!message) return { isValid: false, message: "message is required" };
    if (!feedbackType) return { isValid: false, message: "feedbackType is required" };

    // Validate feedbackType enum
    const validFeedbackTypes = ['complaint', 'compliment', 'suggestion', 'query', 'issue'];
    if (!validFeedbackTypes.includes(feedbackType)) {
        return { isValid: false, message: `feedbackType must be one of: ${validFeedbackTypes.join(', ')}` };
    }

    // Validate status enum if provided
    if (status) {
        const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
        if (!validStatuses.includes(status)) {
            return { isValid: false, message: `status must be one of: ${validStatuses.join(', ')}` };
        }
    }

    // Validate priority enum if provided
    if (priority) {
        const validPriorities = ['Low', 'Medium', 'High', 'Urgent'];
        if (!validPriorities.includes(priority)) {
            return { isValid: false, message: `priority must be one of: ${validPriorities.join(', ')}` };
        }
    }

    // Validate references exist
    const referenceValidation = await validateMultipleReferences({
        studentId: { id: studentId, Model: Student },
        schoolId: { id: schoolId, Model: School }
    });

    if (referenceValidation) {
        return { isValid: false, message: referenceValidation.message };
    }

    return { isValid: true };
};

export const createFeedback = controllerWrapper(async (req, res) => {
    return await createRecord(Feedback, req.body, "feedback", validateFeedbackData);
});

export const getAllFeedbacks = controllerWrapper(async (req, res) => {
    return await getAllRecords(Feedback, "feedbacks", ["studentId", "schoolId"]);
});

export const getFeedbackById = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await getRecordById(Feedback, id, "feedback", ["studentId", "schoolId"]);
});

// Get Feedbacks by Student ID
export const getFeedbacksByStudentId = controllerWrapper(async (req, res) => {
    const { studentId } = req.params;
    return await getAllRecords(
        Feedback,
        "feedbacks",
        ["studentId", "schoolId"],
        { studentId: studentId }
    );
});

// Get Feedbacks by Feedback Type
export const getFeedbacksByFeedbackType = controllerWrapper(async (req, res) => {
    const { feedbackType } = req.params;
    return await getAllRecords(
        Feedback,
        "feedbacks",
        ["studentId", "schoolId"],
        { feedbackType: feedbackType }
    );
});

// Get Feedbacks by School ID
export const getFeedbacksBySchoolId = controllerWrapper(async (req, res) => {
    const { schoolId } = req.params;
    return await getAllRecords(
        Feedback,
        "feedbacks",
        [{
            path: "studentId",
            populate: ["userId"]
        }, "schoolId"],
        { schoolId: schoolId }
    );
});

// Get Feedbacks by School ID and Student ID
export const getFeedbacksBySchoolAndStudent = controllerWrapper(async (req, res) => {
    const { schoolId, studentId } = req.params;
    return await getAllRecords(
        Feedback,
        "feedbacks",
        [{
            path: "studentId",
            populate: ["userId"]
        }, "schoolId"],
        { schoolId: schoolId, studentId: studentId }
    );
});

export const updateFeedback = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await updateRecord(Feedback, id, req.body, "feedback", validateFeedbackData);
});

export const deleteFeedback = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await deleteRecord(Feedback, id, "feedback");
});

export const deleteAllFeedbacks = controllerWrapper(async (req, res) => {
    return await deleteAllRecords(Feedback, "feedbacks");
});

