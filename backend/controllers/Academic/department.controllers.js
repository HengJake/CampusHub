import Department from "../../models/Academic/department.model.js";
import mongoose from "mongoose";    

// Create Department
export const createDepartment = async (req, res) => {
    const { departmentName, DepartmentDescription, RoomID } = req.body;

    // Validation
    if (!departmentName || !DepartmentDescription || !RoomID) {
        return res.status(400).json({
            success: false,
            message: "Please provide all required fields (departmentName, DepartmentDescription, RoomID)",
        });
    }

    if (!mongoose.Types.ObjectId.isValid(RoomID)) {
        return res.status(400).json({
            success: false,
            message: "Invalid RoomID format",
        });
    }

    try {
        const newDepartment = new Department({
            departmentName,
            DepartmentDescription,
            RoomID
        });

        await newDepartment.save();

        return res.status(201).json({
            success: true,
            data: newDepartment,
            message: "Department created successfully",
        });
    } catch (error) {
        console.error("Error creating department:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

// Read Departments
export const getDepartments = async (req, res) => {
    try {
        const departments = await Department.find()
            .populate('RoomID');

        return res.status(200).json({
            success: true,
            data: departments,
        });
    } catch (error) {
        console.error("Error fetching departments:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

// Update Department
export const updateDepartment = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid department ID format",
        });
    }

    try {
        const updatedDepartment = await Department.findByIdAndUpdate(id, updates, { new: true });

        if (!updatedDepartment) {
            return res.status(404).json({
                success: false,
                message: "Department not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: updatedDepartment,
            message: "Department updated successfully",
        });
    } catch (error) {
        console.error("Error updating department:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

// Delete Department
export const deleteDepartment = async (req, res) => {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid department ID format",
        });
    }

    try {
        const deletedDepartment = await Department.findByIdAndDelete(id);

        if (!deletedDepartment) {
            return res.status(404).json({
                success: false,
                message: "Department not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Department deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting department:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

