import Student from "../../models/Academic/student.model";
import mongoose from "mongoose";
import User from "../../models/Academic/user.model";
import Intake from "../../models/Academic/intake.model";

// Create a new student
export const createStudent = async (req, res) => {
    try {
        const student = new Student(req.body);
        await student.save();
        res.status(201).json(student);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all students
export const getAllStudents = async (req, res) => {
    try {
        const students = await Student.find();
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a student by ID
export const getStudentById = async (req, res) => {
    const { UserID } = req.params;
    if (!mongoose.Types.ObjectId.isValid(UserID)) {
        return res.status(400).json({ message: "Invalid student ID" });
    }
    
    try {
        const student = await Student.findById(id);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }
        res.status(200).json(student);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a student by ID
export const updateStudentById = async (req, res) => {
    const { UserID } = req.params;
    if (!mongoose.Types.ObjectId.isValid(UserID)) {
        return res.status(400).json({ message: "Invalid student ID" });
    }

    try {
        const student = await Student.findByIdAndUpdate(UserID, req.body, { new: true });
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }
        res.status(200).json(student);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a student by ID
export const deleteStudentById = async (req, res) => {
    const { UserID } = req.params;
    if (!mongoose.Types.ObjectId.isValid(UserID)) {
        return res.status(400).json({ message: "Invalid student ID" });
    }

    try {
        const student = await Student.findByIdAndDelete(UserID);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }
        res.status(200).json({ message: "Student deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get students by school ID
export const getStudentsBySchoolId = async (req, res) => {
    const { SchoolID } = req.params;
    if (!mongoose.Types.ObjectId.isValid(SchoolID)) {
        return res.status(400).json({ message: "Invalid school ID" });
    }

    try {
        const students = await Student.find({ SchoolID });
        if (students.length === 0) {
            return res.status(404).json({ message: "No students found for this school" });
        }
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get students by intake ID
export const getStudentsByIntakeID = async (req, res) => {
    const { IntakeID } = req.params;
    if (!mongoose.Types.ObjectId.isValid(IntakeID)) {
        return res.status(400).json({ message: "Invalid course ID" });
    }

    try {
        const students = await Student.find({ Intake: IntakeID });
        if (students.length === 0) {
            return res.status(404).json({ message: "No students found for this course" });
        }
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Get students by course ID
export const getStudentsByCourseId = async (req, res) => {
    const { CourseID } = req.params;
    if (!mongoose.Types.ObjectId.isValid(CourseID)) {
        return res.status(400).json({ message: "Invalid course ID" });
    }

    try {
        const students = await Student.find({ Course: CourseID });
        if (students.length === 0) {
            return res.status(404).json({ message: "No students found for this course" });
        }
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get students by year
export const getStudentsByYear = async (req, res) => {
    const { year } = req.params;
    if (!Number.isInteger(Number(year)) || Number(year) < 1 || Number(year) > 5) {
        return res.status(400).json({ message: "Invalid year" });
    }

    try {
        const students = await Student.find({ Year: year });
        if (students.length === 0) {
            return res.status(404).json({ message: "No students found for this year" });
        }
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


