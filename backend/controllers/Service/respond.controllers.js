import Respond from "../../models/Service/respond.model.js";
import { createRecord, getAllRecords, getRecordById, updateRecord, deleteRecord, controllerWrapper } from "../../utils/reusable.js";

// Create Respond
export const createRespond = controllerWrapper(async (req, res) => {
    return await createRecord(Respond, req.body, "respond");
});

// Get all Responds
export const getAllResponds = controllerWrapper(async (req, res) => {
    return await getAllRecords(Respond, "responds");
});

// Get Respond by ID
export const getRespondById = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await getRecordById(Respond, id, "respond");
});

// Get Responds by Feedback ID
export const getRespondsByFeedbackId = controllerWrapper(async (req, res) => {
    const { feedbackId } = req.params;
    return await getAllRecords(
        Respond,
        "responds",
        [],
        { FeedbackID: feedbackId }
    );
});

// Get Responds by School ID
export const getRespondsBySchoolId = controllerWrapper(async (req, res) => {
    const { schoolId } = req.params;
    return await getAllRecords(
        Respond,
        "responds",
        [],
        { schoolId: schoolId }
    );
});

// Update Respond
export const updateRespond = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await updateRecord(Respond, id, req.body, "respond");
});

// Delete Respond
export const deleteRespond = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await deleteRecord(Respond, id, "respond");
});

export const deleteAllResponds = async (req, res) => {
    try {
        await Respond.deleteMany({});
        res.status(200).json({ message: 'All responds deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting all responds', error: error.message });
    }
};