import Attendace from "../../models/Academic/attendance.model";
import mongoose from "mongoose";

//Create Attendance Record
export const createAttendance = async (req, res) => {
    const { StudentID, ScheduleID, Status, Date } = req.body;

    // Validation
    if (!StudentID || !ScheduleID || !Status || !Date) {
        return res.status(400).json({
            success: false,
            message: "Please provide all required fields (StudentID, ScheduleID, Status, Date)",
        });
    }

    if (!["present", "absent", "late"].includes(Status)) {
        return res.status(400).json({
            success: false,
            message: "Status must be either 'present', 'absent', or 'late'",
        });
    }

    try {
        const newAttendance = new Attendace({
            StudentID,
            ScheduleID,
            Status,
            Date,
        });

        await newAttendance.save();

        return res.status(201).json({
            success: true,
            data: newAttendance,
            message: "Attendance record created successfully",
        });
    } catch (error) {
        console.error("Error creating attendance record:", error.message);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Attendance record already exists for this student and schedule",
            });
        }

        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
}

//Read Attendance Record
export const getAttendance = async (req, res) => {
    try {
        const attendanceRecords = await Attendace.find()
            .populate('StudentID')
            .populate('ScheduleID');

        return res.status(200).json({
            success: true,
            data: attendanceRecords,
            message: "Attendance records retrieved successfully",
        });
    } catch (error) {
        console.error("Error retrieving attendance records:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
}

//Update Attendance Record
export const updateAttendance = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid attendance ID format" });
    }

    try {
        const updatedAttendance = await Attendace.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true
        });

        if (!updatedAttendance) {
            return res.status(404).json({ success: false, message: "Attendance record not found" });
        }

        return res.status(200).json({
            success: true,
            data: updatedAttendance,
            message: "Attendance record updated successfully",
        });
    } catch (error) {
        console.error("Error updating attendance record:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

//Delete Attendance Record
export const deleteAttendance = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid attendance ID format" });
    }

    try {
        const deletedAttendance = await Attendace.findByIdAndDelete(id);

        if (!deletedAttendance) {
            return res.status(404).json({ success: false, message: "Attendance record not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Attendance record deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting attendance record:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};