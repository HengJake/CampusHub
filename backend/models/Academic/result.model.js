// Programmer Name : Ritchie Boon Win Yew, Backend Developer
// Program Name: result.model.js
// Description: Result model schema defining student academic performance, grades, GPA calculation, and transcript management
// First Written on: July 10, 2024
// Edited on: Friday, July 10, 2024

import mongoose from "mongoose";

const resultSchema = new mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',
            required: true
        },
        moduleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Module',
            required: true
        },
        semesterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Semester',
            required: true
        },
        grade: {
            type: String,
            enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F'],
            required: true
        },
        creditHours: {
            type: Number,
            required: true
        },
        marks: {
            type: Number,
            min: 0,
            max: 100
        },
        totalMarks: {
            type: Number,
            min: 0,
            default: 100
        },
        gpa: {
            type: Number,
            min: 0,
            max: 4.0
        },
        remark: {
            type: String,
            default: "No feedback from lecturer"
        },
        schoolId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'School',
            required: true
            // Each result belongs to a specific school
        }
    },
    { timestamps: true }
);

const Result = mongoose.model("Result", resultSchema);

export default Result;