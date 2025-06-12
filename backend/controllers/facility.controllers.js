import Facility from "../models/facility.model.js";
import mongoose from "mongoose";

export const createFacility = async (req, res) => {
    const facilty = req.body;
    if (!facilty.FacilitiesName || !facilty.Type || !facilty.Description || !facilty.Availability) {
        return res.status(400).json({ message: "Please provide all fields" });
    }

    const newFacility = new Facility(facilty);

    try {
        await newFacility.save();
        res.status(201).json({success: true, message: "Facility created successfully", data: newFacility});
    }catch (error) {
        console.error("Error in creating facility:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const getFacility = async (req, res) => {
        try {
        const facilities = await Facility.find({});
        res.status(200).json({ success: true, count: facilities.length, data: facilities });
    } catch (error) {
        console.error("Error in fetching facilities:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const updateFacilty = async (req, res) => {
        try {
        const updatedFacility = await Facility.findByIdAndUpdate(
            req.params.id, 
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedFacility) {
            return res.status(404).json({ success: false, message: "Facility not found" });
        }

        res.status(200).json({ success: true, message: "Facility updated successfully", data: updatedFacility });
    } catch (error) {
        console.error("Error in updating facility:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const deleteFacility = async (req, res) => {
        try {
        const deletedFacility = await Facility.findByIdAndDelete(req.params.id); 

        if (!deletedFacility) {
            return res.status(404).json({ success: false, message: "Facility not found" });
        }

        res.status(200).json({ success: true, message: "Facility deleted successfully" });
    } catch (error) {
        console.error("Error in deleting facility:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

