import Feedback from "../../models/Service/feedback.model.js";
import { createRecord, getAllRecords, getRecordById, updateRecord, deleteRecord, controllerWrapper } from "../../utils/reusable.js";

// Create Feedback
export const createFeedback = controllerWrapper(async (req, res) => {
    console.log("Creating feedback with body:", req.body);
    
    // Add the authenticated user's ID if not provided
    if (!req.body.studentId && req.body.id) {
        req.body.studentId = req.body.id;
    }
    
    // Ensure we have a studentId
    if (!req.body.studentId) {
        return res.status(400).json({ 
            success: false, 
            message: "Student ID is required" 
        });
    }
    
    console.log("Final feedback data:", req.body);
    return await createRecord(Feedback, req.body, "feedback");
});

// Get all Feedbacks
export const getAllFeedbacks = controllerWrapper(async (req, res) => {
    return await getAllRecords(Feedback, "feedbacks");
});

// Get Feedback by ID
export const getFeedbackById = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await getRecordById(Feedback, id, "feedback");
});

// Get Feedbacks by Student ID
export const getFeedbacksByStudentId = controllerWrapper(async (req, res) => {
    const { studentId } = req.params;
    console.log("Fetching feedback for student ID:", studentId);
    
    const result = await getAllRecords(
        Feedback,
        "feedbacks",
        [],
        { studentId: studentId }
    );
    
    console.log("Found feedback records:", result);
    return result;
});

// Get Feedbacks by Feedback Type
export const getFeedbacksByFeedbackType = controllerWrapper(async (req, res) => {
    const { feedbackType } = req.params;
    return await getAllRecords(
        Feedback,
        "feedbacks",
        [],
        { feedbackType: feedbackType }
    );
});

// Update Feedback
export const updateFeedback = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await updateRecord(Feedback, id, req.body, "feedback");
});

// Delete Feedback
export const deleteFeedback = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await deleteRecord(Feedback, id, "feedback");
});

export const deleteAllFeedbacks = async (req, res) => {
    try {
        await Feedback.deleteMany({});
        res.status(200).json({ message: 'All feedbacks deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting all feedbacks', error: error.message });
    }
};

