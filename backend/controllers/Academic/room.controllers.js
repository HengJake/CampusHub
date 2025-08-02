import Room from '../../models/Academic/room.model.js';
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

export const getRoomsBySchool = controllerWrapper(async (req, res) => {
    const { schoolId } = req.params;
    return await getAllRecords(
        Room,
        "rooms",
        ["schoolId"],
        { schoolId }
    );
});