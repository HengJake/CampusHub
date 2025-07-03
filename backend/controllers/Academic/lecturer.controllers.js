import Lecturer from "../../models/Academic/lecturer.model";    
import mongoose from "mongoose";

//Create Lecturer
export const createLecturer = async (req, res) => {
    const { LecturerName, LecturerEmail, DepartmentID } = req.body;

    // Validate required fields
    if (!LecturerName || !LecturerEmail || !DepartmentID) {
        return res.status(400).json({
            success: false,
            message: "Please provide all required fields (LecturerName, LecturerEmail, DepartmentID)",
        });
    }

    if (!mongoose.Types.ObjectId.isValid(DepartmentID)) {
        return res.status(400).json({
            success: false,
            message: "Invalid DepartmentID format",
        });
    }

    try {
        const newLecturer = new Lecturer({
            LecturerName,
            LecturerEmail,
            DepartmentID    
        });

        await newLecturer.save();

        return res.status(201).json({
            success: true,
            data: newLecturer,
            message: "Lecturer created successfully"
        });
    } catch (error) {
        console.error("Error creating lecturer:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

//Read Lecturer
export const getLecturers = async (req, res) => {
    try {
        const lecturers = await Lecturer.find()
            .populate('DepartmentID');

        return res.status(200).json({
            success: true,
            data: lecturers,
        });
    } catch (error) {
        console.error("Error fetching lecturers:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

//Update Lecturer
export const updateLecturer = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid lecturer ID format"
        });
    }

    try {
        const updatedLecturer = await Lecturer.findByIdAndUpdate(id, updates, { new: true });

        if (!updatedLecturer) {
            return res.status(404).json({
                success: false,
                message: "Lecturer not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: updatedLecturer,
            message: "Lecturer updated successfully"
        });
    } catch (error) {
        console.error("Error updating lecturer:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// Delete Lecturer
export const deleteLecturer = async (req, res) => {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid lecturer ID format"
        });
    }

    try {
        const deletedLecturer = await Lecturer.findByIdAndDelete(id);

        if (!deletedLecturer) {
            return res.status(404).json({
                success: false,
                message: "Lecturer not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Lecturer deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting lecturer:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};
