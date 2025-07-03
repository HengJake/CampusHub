import classSchedule from '../../models/Academic/classSchedule.model.js';
import mongoose from 'mongoose';

// Create Class Schedule
export const createClassSchedule = async (req, res) => {
    const { RoomID, ModuleID, LecturerID, DayOfWeek, StartTime, EndTime, IntakeID } = req.body;

    // Validation
    if (!RoomID || !ModuleID || !LecturerID || !DayOfWeek || !StartTime || !EndTime || !IntakeID) {
        return res.status(400).json({
            success: false,
            message: "Please provide all required fields (RoomID, ModuleID, LecturerID, DayOfWeek, StartTime, EndTime, IntakeID)",
        });
    }

    if (!mongoose.Types.ObjectId.isValid(RoomID) || !mongoose.Types.ObjectId.isValid(ModuleID) ||
        !mongoose.Types.ObjectId.isValid(LecturerID) || !mongoose.Types.ObjectId.isValid(IntakeID)) {
        return res.status(400).json({
            success: false,
            message: "Invalid Object ID format",
        });
    }

    try {
        const newClassSchedule = new classSchedule({
            RoomID,
            ModuleID,
            LecturerID,
            DayOfWeek,
            StartTime,
            EndTime,
            IntakeID
        });

        await newClassSchedule.save();

        return res.status(201).json({
            success: true,
            data: newClassSchedule,
            message: "Class schedule created successfully",
        });
    } catch (error) {
        console.error("Error creating class schedule:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

// Read Class Schedule
export const getClassSchedules = async (req, res) => {
    try {
        const classSchedules = await classSchedule.find()
            .populate('RoomID')
            .populate('ModuleID')
            .populate('LecturerID')
            .populate('IntakeID');

        return res.status(200).json({
            success: true,
            data: classSchedules,
        });
    } catch (error) {
        console.error("Error fetching class schedules:", error.message);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
}

// Update Class Schedule
export const updateClassSchedule = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid class schedule ID format",
        });
    }

    try {
        const updatedClassSchedule = await classSchedule.findByIdAndUpdate(id, updates, { new: true })
            .populate('RoomID')
            .populate('ModuleID')
            .populate('LecturerID')
            .populate('IntakeID');

        if (!updatedClassSchedule) {
            return res.status(404).json({
                success: false,
                message: "Class schedule not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: updatedClassSchedule,
            message: "Class schedule updated successfully",
        });
    } catch (error) {
        console.error("Error updating class schedule:", error.message);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
}

// Delete Class Schedule
export const deleteClassSchedule = async (req, res) => {
    const { id } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid class schedule ID format",
        });
    }

    try {
        const deletedClassSchedule = await classSchedule.findByIdAndDelete(id);

        if (!deletedClassSchedule) {
            return res.status(404).json({
                success: false,
                message: "Class schedule not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Class schedule deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting class schedule:", error.message);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};