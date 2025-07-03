import Course from '../../models/Academic/course.model.js';
import mongoose from 'mongoose';

//Create Course
export const createCourse = async (req, res) => {
    const { CourseName, Duration, ModuleID} = req.body;

    // Validate required fields
    if (!CourseName || !Duration || !ModuleID ) {
        return res.status(400).json({
            success: false,
            message: "Please provide all required fields (CourseName, Duration, ModuleID)",
        });
    }

    try {
        const newCourse = new Course({
            CourseName,
            Duration,
            ModuleID    
        });

        await newCourse.save();

        return res.status(201).json({
            success: true,
            data: newCourse,
            message: "Course created successfully"
        });
    } catch (error) {
        console.error("Error creating course:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

//Read Course
export const getCourses = async (req, res) => {
    try {
        const courses = await Course.find()
            .populate('ModuleID');

        return res.status(200).json({
            success: true,
            data: courses,
        });
    } catch (error) {
        console.error("Error fetching courses:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

//Update Course
export const updateCourse = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid course ID format"
        });
    }

    try {
        const updatedCourse = await Course.findByIdAndUpdate(id, updates, { new: true })
            .populate('ModuleID');

        if (!updatedCourse) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: updatedCourse,
            message: "Course updated successfully"
        });
    } catch (error) {
        console.error("Error updating course:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

//Delete Course
export const deleteCourse = async (req, res) => {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid course ID format"
        });
    }

    try {
        const deletedCourse = await Course.findByIdAndDelete(id);

        if (!deletedCourse) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Course deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting course:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};