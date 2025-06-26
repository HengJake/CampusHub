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
}