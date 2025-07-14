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