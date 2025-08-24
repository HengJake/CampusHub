import SemesterModule from "../../models/Academic/semesterModule.model.js";
import Semester from "../../models/Academic/semester.model.js";
import Module from "../../models/Academic/module.model.js";
import {
    createRecord,
    getAllRecords,
    getRecordById,
    updateRecord,
    deleteRecord,
    controllerWrapper
} from "../../utils/reusable.js";

// Get all semester modules by school ID
export const getSemesterModulesBySchoolId = controllerWrapper(async (req, res) => {
    const { schoolId } = req.params;
    return await getAllRecords(
        SemesterModule,
        "semesterModules",
        [
            { path: 'semesterId' },
            { path: 'moduleId' },
            { path: 'courseId' },
            { path: 'intakeCourseId' },
            { path: 'schoolId' }
        ],
        { schoolId, isActive: true }
    );
});

// Get modules for a specific semester
export const getModulesBySemester = controllerWrapper(async (req, res) => {
    const { semesterId } = req.params;
    return await getAllRecords(
        SemesterModule,
        "semesterModules",
        [
            { path: 'moduleId' },
            { path: 'courseId' },
            { path: 'intakeCourseId' }
        ],
        { semesterId, isActive: true }
    );
});

// Get semesters for a specific module
export const getSemestersByModule = controllerWrapper(async (req, res) => {
    const { moduleId } = req.params;
    return await getAllRecords(
        SemesterModule,
        "semesterModules",
        [
            { path: 'semesterId' },
            { path: 'courseId' },
            { path: 'intakeCourseId' }
        ],
        { moduleId, isActive: true }
    );
});

// Add module to semester
export const addModuleToSemester = controllerWrapper(async (req, res) => {
    const { semesterId, moduleId, courseId, intakeCourseId, schoolId } = req.body;

    // Check if module is already assigned to this semester
    const existingAssignment = await SemesterModule.findOne({
        semesterId,
        moduleId,
        isActive: true
    });

    if (existingAssignment) {
        return {
            success: false,
            message: "Module is already assigned to this semester"
        };
    }

    // Validate that semester exists
    const semester = await Semester.findById(semesterId);
    if (!semester) {
        return {
            success: false,
            message: "Semester not found"
        };
    }

    // Validate that module exists
    const module = await Module.findById(moduleId);
    if (!module) {
        return {
            success: false,
            message: "Module not found"
        };
    }

    // Validate that module belongs to the course
    if (!module.courseId.includes(courseId)) {
        return {
            success: false,
            message: "Module does not belong to this course"
        };
    }

    const semesterModuleData = {
        semesterId,
        moduleId,
        courseId,
        intakeCourseId,
        schoolId
    };

    return await createRecord(SemesterModule, semesterModuleData, "semesterModule");
});

// Remove module from semester
export const removeModuleFromSemester = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await deleteRecord(SemesterModule, id, "semesterModule");
});

// Get semester module by ID
export const getSemesterModuleById = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await getRecordById(SemesterModule, id, "semesterModule");
});

// Update semester module
export const updateSemesterModule = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await updateRecord(SemesterModule, id, req.body, "semesterModule");
});

// Get module count for a semester
export const getModuleCountBySemester = controllerWrapper(async (req, res) => {
    const { semesterId } = req.params;
    
    const count = await SemesterModule.countDocuments({
        semesterId,
        isActive: true
    });

    return {
        success: true,
        data: { count },
        message: "Module count retrieved successfully"
    };
});

// Get available modules for a semester (modules that can be added)
export const getAvailableModulesForSemester = controllerWrapper(async (req, res) => {
    const { semesterId, courseId, schoolId } = req.params;

    // Get all modules for the course
    const allModules = await Module.find({
        courseId: { $in: [courseId] },
        schoolId,
        isActive: true
    });

    // Get modules already assigned to this semester
    const assignedModules = await SemesterModule.find({
        semesterId,
        isActive: true
    }).select('moduleId');

    const assignedModuleIds = assignedModules.map(sm => sm.moduleId.toString());

    // Filter out already assigned modules
    const availableModules = allModules.filter(module => 
        !assignedModuleIds.includes(module._id.toString())
    );

    return {
        success: true,
        data: availableModules,
        message: "Available modules retrieved successfully"
    };
});
