import Intake from "../../models/Academic/intake.model.js";
import mongoose from "mongoose";

// Create Intake
export const createIntake = async (req, res) => {
    const { IntakeName, IntakeDescription, IntakeStartDate, IntakeEndDate } = req.body;

    // Validation
    if (!IntakeName || !IntakeDescription || !IntakeStartDate || !IntakeEndDate) {
        return res.status(400).json({
            success: false,
            message: "Please provide all required fields (IntakeName, IntakeDescription, IntakeStartDate, IntakeEndDate)",
        });
    }

    try {
        const newIntake = new Intake({
            IntakeName,
            IntakeDescription,
            IntakeStartDate,
            IntakeEndDate
        });

        await newIntake.save();

        return res.status(201).json({
            success: true,
            data: newIntake,
            message: "Intake created successfully",
        });
    } catch (error) {
        console.error("Error creating intake:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

// Read Intakes
export const getIntakes = async (req, res) => {
    try {
        const intakes = await Intake.find();

        return res.status(200).json({
            success: true,
            data: intakes,
        });
    } catch (error) {
        console.error("Error fetching intakes:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

// Update Intake
export const updateIntake = async (req, res) => {
    const { id } = req.params;
    const { IntakeName, IntakeDescription, IntakeStartDate, IntakeEndDate } = req.body;

    // Validation
    if (!IntakeName || !IntakeDescription || !IntakeStartDate || !IntakeEndDate) {
        return res.status(400).json({
            success: false,
            message: "Please provide all required fields (IntakeName, IntakeDescription, IntakeStartDate, IntakeEndDate)",
        });
    }

    try {
        const updatedIntake = await Intake.findByIdAndUpdate(id, {
            IntakeName,
            IntakeDescription,
            IntakeStartDate,
            IntakeEndDate
        }, { new: true });

        if (!updatedIntake) {
            return res.status(404).json({
                success: false,
                message: "Intake not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: updatedIntake,
            message: "Intake updated successfully",
        });
    } catch (error) {
        console.error("Error updating intake:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Delete Intake
export const deleteIntake = async (req, res) => {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid intake ID format",
        });
    }

    try {
        const deletedIntake = await Intake.findByIdAndDelete(id);

        if (!deletedIntake) {
            return res.status(404).json({
                success: false,
                message: "Intake not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Intake deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting intake:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

