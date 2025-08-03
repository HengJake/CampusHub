import Result from "../../models/Academic/result.model.js";
import Student from "../../models/Academic/student.model.js";
import Module from "../../models/Academic/module.model.js";
import Semester from "../../models/Academic/semester.model.js";
import {
    createRecord,
    getAllRecords,
    getRecordById,
    updateRecord,
    deleteRecord,
    validateMultipleReferences,
    controllerWrapper,
    deleteAllRecords
} from "../../utils/reusable.js";

const validateResultData = async (data) => {
    const { studentId, moduleId, semesterId, grade, creditHours, remark } = data;
    // Check required fields
    if (!studentId) {
        return {
            isValid: false,
            message: "studentId is required"
        };
    }
    if (!moduleId) {
        return {
            isValid: false,
            message: "moduleId is required"
        };
    }
    if (!semesterId) {
        return {
            isValid: false,
            message: "semesterId is required"
        };
    }
    if (!grade) {
        return {
            isValid: false,
            message: "grade is required"
        };
    }
    if (!creditHours) {
        return {
            isValid: false,
            message: "creditHours is required"
        };
    }

    // Validate credit hour range
    if (creditHours < 0 || creditHours > 4) {
        return {
            isValid: false,
            message: "creditHours must be between 0 and 4"
        };
    }

    // Validate grade
    const validGrades = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F'];
    if (!validGrades.includes(grade)) {
        return {
            isValid: false,
            message: "grade must be one of: A, B, C, D, F"
        };
    }

    // Validate references exist
    const referenceValidation = await validateMultipleReferences({
        studentId: { id: studentId, Model: Student },
        moduleId: { id: moduleId, Model: Module },
        semesterId: { id: semesterId, Model: Semester }
    });

    if (referenceValidation) {
        return {
            isValid: false,
            message: referenceValidation.message
        };
    }

    return { isValid: true };
};

export const createResult = controllerWrapper(async (req, res) => {
    return await createRecord(
        Result,
        req.body,
        "result",
        validateResultData
    );
});

export const getAllResults = controllerWrapper(async (req, res) => {
    return await getAllRecords(Result, "results", ["studentId", "moduleId", "semesterId"]);
});

export const getResultById = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await getRecordById(Result, id, "result", ["studentId", "moduleId", "semesterId"]);
});

export const updateResult = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await updateRecord(Result, id, req.body, "result", validateResultData);
});

export const deleteResult = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await deleteRecord(Result, id, "result");
});

export const getResultsByStudentId = controllerWrapper(async (req, res) => {
    const { studentId } = req.params;
    return await getAllRecords(
        Result,
        "results",
        ["studentId", "moduleId", "semesterId"],
        { studentId }
    );
});

export const getResultsByModuleId = controllerWrapper(async (req, res) => {
    const { moduleId } = req.params;
    return await getAllRecords(
        Result,
        "results",
        ["studentId", "moduleId", "semesterId"],
        { moduleId }
    );
});

export const getResultsBySemesterId = controllerWrapper(async (req, res) => {
    const { semesterId } = req.params;
    return await getAllRecords(
        Result,
        "results",
        ["studentId", "moduleId", "semesterId"],
        { semesterId }
    );
});

export const getResultsByGrade = controllerWrapper(async (req, res) => {
    const { grade } = req.params;

    // Validate grade parameter
    const validGrades = ["A", "B", "C", "D", "F"];
    if (!validGrades.includes(grade)) {
        return {
            success: false,
            message: "grade must be one of: A, B, C, D, F",
            statusCode: 400
        };
    }

    return await getAllRecords(
        Result,
        "results",
        ["studentId", "moduleId", "semesterId"],
        { grade }
    );
});

export const getStudentGPA = controllerWrapper(async (req, res) => {
    const { studentId } = req.params;

    try {
        const results = await Result.find({ studentId }).populate(['moduleId', 'semesterId']);

        if (results.length === 0) {
            return {
                success: false,
                message: "No results found for this student",
                statusCode: 404
            };
        }

        // Calculate GPA
        let totalGradePoints = 0;
        let totalCreditHours = 0;

        const gradePointMap = {
            'A': 4.0,
            'B': 3.0,
            'C': 2.0,
            'D': 1.0,
            'F': 0.0
        };

        results.forEach(result => {
            const gradePoints = gradePointMap[result.grade] * result.creditHours;
            totalGradePoints += gradePoints;
            totalCreditHours += result.creditHours;
        });

        const gpa = totalCreditHours > 0 ? (totalGradePoints / totalCreditHours).toFixed(2) : 0;

        return {
            success: true,
            data: {
                studentId,
                gpa: parseFloat(gpa),
                totalCreditHours,
                totalResults: results.length,
                results
            },
            message: "Student GPA calculated successfully",
            statusCode: 200
        };
    } catch (error) {
        return {
            success: false,
            message: "Error calculating GPA",
            statusCode: 500
        };
    }
});

export const getModuleStatistics = controllerWrapper(async (req, res) => {
    const { moduleId } = req.params;

    try {
        const results = await Result.find({ moduleId }).populate(['studentId', 'semesterId']);

        if (results.length === 0) {
            return {
                success: false,
                message: "No results found for this module",
                statusCode: 404
            };
        }

        // Calculate statistics
        const gradeCounts = { A: 0, B: 0, C: 0, D: 0, F: 0 };
        let totalStudents = results.length;
        let passCount = 0; // A, B, C, D are passing grades

        results.forEach(result => {
            gradeCounts[result.grade]++;
            if (['A', 'B', 'C', 'D'].includes(result.grade)) {
                passCount++;
            }
        });

        const passRate = ((passCount / totalStudents) * 100).toFixed(2);

        return {
            success: true,
            data: {
                moduleId,
                totalStudents,
                passCount,
                failCount: totalStudents - passCount,
                passRate: parseFloat(passRate),
                gradeDistribution: gradeCounts,
                results
            },
            message: "Module statistics calculated successfully",
            statusCode: 200
        };
    } catch (error) {
        return {
            success: false,
            message: "Error calculating module statistics",
            statusCode: 500
        };
    }
});

export const getSemesterStatistics = controllerWrapper(async (req, res) => {
    const { semesterId } = req.params;

    try {
        const results = await Result.find({ semesterId }).populate(['studentId', 'moduleId']);

        if (results.length === 0) {
            return {
                success: false,
                message: "No results found for this semester",
                statusCode: 404
            };
        }

        // Calculate statistics
        const gradeCounts = { A: 0, B: 0, C: 0, D: 0, F: 0 };
        let totalStudents = results.length;
        let passCount = 0; // A, B, C, D are passing grades

        results.forEach(result => {
            gradeCounts[result.grade]++;
            if (['A', 'B', 'C', 'D'].includes(result.grade)) {
                passCount++;
            }
        });

        const passRate = ((passCount / totalStudents) * 100).toFixed(2);

        return {
            success: true,
            data: {
                semesterId,
                totalStudents,
                passCount,
                failCount: totalStudents - passCount,
                passRate: parseFloat(passRate),
                gradeDistribution: gradeCounts,
                results
            },
            message: "Semester statistics calculated successfully",
            statusCode: 200
        };
    } catch (error) {
        return {
            success: false,
            message: "Error calculating semester statistics",
            statusCode: 500
        };
    }
});

// Delete All Results
export const deleteAllResults = controllerWrapper(async (req, res) => {
    return await deleteAllRecords(Result, "results");
});

export const getResultsBySchool = controllerWrapper(async (req, res) => {
    const { schoolId } = req.params;
    return await getAllRecords(
        Result,
        "results",
        [
            {
                path: "studentId",
                populate: {
                    path: ["intakeCourseId", "userId"]
                }
            },
            {
                path: "semesterId",
                populate: {
                    path: ["courseId"]
                }
            }
            , "moduleId", "schoolId"],
        { schoolId }
    );
});