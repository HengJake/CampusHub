import ExamSchedule from "../../models/Academic/examSchedule.model";
import mongoose from "mongoose";

// Create Exam Schedule
export const createExamSchedule = async (req, res) => {
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
        const newExamSchedule = new ExamSchedule({
            RoomID,
            ModuleID,
            LecturerID,
            DayOfWeek,
            StartTime,
            EndTime,
            IntakeID
        });

        await newExamSchedule.save();

        return res.status(201).json({
            success: true,
            data: newExamSchedule,
            message: "Exam schedule created successfully",
        });
    } catch (error) {
        console.error("Error creating exam schedule:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Read Exam Schedule
export const getExamSchedules = async (req, res) => {
    try {
        const examSchedules = await ExamSchedule.find()
            .populate('RoomID')
            .populate('ModuleID')
            .populate('LecturerID')
            .populate('IntakeID');

        return res.status(200).json({
            success: true,
            data: examSchedules,
        });
    } catch (error) {
        console.error("Error fetching exam schedules:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

// Update Exam Schedule
export const updateExamSchedule = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid exam schedule ID format",
        });
    }

    try {
        const updatedExamSchedule = await ExamSchedule.findByIdAndUpdate(id, updates, { new: true })
            .populate('RoomID')
            .populate('ModuleID')
            .populate('LecturerID')
            .populate('IntakeID');

        if (!updatedExamSchedule) {
            return res.status(404).json({
                success: false,
                message: "Exam schedule not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: updatedExamSchedule,
            message: "Exam schedule updated successfully",
        });
    } catch (error) {
        console.error("Error updating exam schedule:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

// Delete Exam Schedule
export const deleteExamSchedule = async (req, res) => {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid exam schedule ID format",
        });
    }

    try {
        const deletedExamSchedule = await ExamSchedule.findByIdAndDelete(id);

        if (!deletedExamSchedule) {
            return res.status(404).json({
                success: false,
                message: "Exam schedule not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Exam schedule deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting exam schedule:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
                                                                                                                                                                