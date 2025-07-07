import Room from '../../models/Academic/room.model.js';
import {
    createRecord,
    getAllRecords,
    getRecordById,
    updateRecord,
    deleteRecord,
    controllerWrapper
} from "../../utils/reusable.js";

const validateRoomData = async (data) => {
    const { RoomName, RoomDescription, Capacity } = data;

    // Check required fields
    if (!RoomName) {
        return {
            isValid: false,
            message: "RoomName is required"
        };
    }
    if (!RoomDescription) {
        return {
            isValid: false,
            message: "RoomDescription is required"
        };
    }
    if (!Capacity) {
        return {
            isValid: false,
            message: "Capacity is required"
        };
    }

    // Validate RoomName is not empty
    if (RoomName.trim().length === 0) {
        return {
            isValid: false,
            message: "RoomName cannot be empty"
        };
    }

    // Validate RoomDescription is not empty
    if (RoomDescription.trim().length === 0) {
        return {
            isValid: false,
            message: "RoomDescription cannot be empty"
        };
    }

    // Validate Capacity is a positive number
    if (typeof Capacity !== 'number' || Capacity <= 0) {
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