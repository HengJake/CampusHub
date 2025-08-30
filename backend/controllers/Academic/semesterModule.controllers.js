import SemesterModule from "../../models/Academic/semesterModule.model.js";
import Semester from "../../models/Academic/semester.model.js";
import Module from "../../models/Academic/module.model.js";
import IntakeCourse from "../../models/Academic/intakeCourse.model.js";
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
            { path: 'intakeCourseId' }
        ],
        { moduleId, isActive: true }
    );
}); 
 
// Add module to semester
export const addModuleToSemester = controllerWrapper(async (req, res) => {
    console.log("🚀 ~ addModuleToSemester ~ Request body:", req.body);
    
    const { semesterId, moduleId, intakeCourseId, schoolId, academicYear, semesterNumber, notes, customAssessmentMethods, semesterSpecificRequirements } = req.body;

    console.log("🚀 ~ addModuleToSemester ~ Checking for existing assignment...");
    
    // Check if module is already assigned to this semester
    const existingAssignment = await SemesterModule.findOne({
        semesterId,
        moduleId,
        isActive: true
    });

    console.log("🚀 ~ addModuleToSemester ~ Existing assignment:", existingAssignment);

    if (existingAssignment) {
        return {
            success: false,
            message: "Module is already assigned to this semester"
        };
    }

    console.log("🚀 ~ addModuleToSemester ~ Validating semester...");
    
    // Validate that semester exists
    const semester = await Semester.findById(semesterId);
    console.log("🚀 ~ addModuleToSemester ~ Semester found:", semester);
    
    if (!semester) {
        return {
            success: false,
            message: "Semester not found"
        };
    }

    console.log("🚀 ~ addModuleToSemester ~ Validating module...");
    
    // Validate that module exists
    const module = await Module.findById(moduleId);
    console.log("🚀 ~ addModuleToSemester ~ Module found:", module);
    
    if (!module) {
        return {
            success: false,
            message: "Module not found"
        };
    }

    console.log("🚀 ~ addModuleToSemester ~ Validating intake course...");
    
    // Validate that intake course exists and get courseId from it
    const intakeCourse = await IntakeCourse.findById(intakeCourseId).populate('courseId');
    console.log("🚀 ~ addModuleToSemester ~ IntakeCourse found:", intakeCourse);
    
    if (!intakeCourse) {
        return {
            success: false,
            message: "Intake course not found"
        };
    }

    const courseId = intakeCourse.courseId._id || intakeCourse.courseId;
    console.log("🚀 ~ addModuleToSemester ~ Course ID from intake course:", courseId);
    console.log("🚀 ~ addModuleToSemester ~ Module courseId:", module.courseId);
    
    // Validate that module belongs to the course
    if (!module.courseId.includes(courseId)) {
        return {
            success: false,
            message: "Module does not belong to this course"
        };
    }

    // Validate required fields
    if (!academicYear || !semesterNumber) {
        return {
            success: false,
            message: "academicYear and semesterNumber are required fields"
        };
    }

    const semesterModuleData = {
        semesterId,
        moduleId,
        intakeCourseId,
        schoolId,
        academicYear,
        semesterNumber,
        notes,
        customAssessmentMethods,
        semesterSpecificRequirements
    };

    console.log("🚀 ~ addModuleToSemester ~ Final semesterModuleData:", semesterModuleData);
    console.log("🚀 ~ addModuleToSemester ~ Calling createRecord...");

    const result = await createRecord(SemesterModule, semesterModuleData, "semesterModule");
    console.log("🚀 ~ addModuleToSemester ~ createRecord result:", result);

    return result;
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
    const { semesterId, intakeCourseId, schoolId } = req.params;

    // Get the intake course to find the courseId
    const intakeCourse = await IntakeCourse.findById(intakeCourseId).populate('courseId');
    if (!intakeCourse) {
        return {
            success: false,
            message: "Intake course not found"
        };
    }

    const courseId = intakeCourse.courseId._id || intakeCourse.courseId;

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

// Get semester modules by intake course and academic year
export const getSemesterModulesByIntakeCourseAndYear = controllerWrapper(async (req, res) => {
    const { intakeCourseId, academicYear, schoolId } = req.params;
    
    const semesterModules = await SemesterModule.find({
        intakeCourseId,
        academicYear: parseInt(academicYear),
        schoolId,
        isActive: true
    }).populate([
        { path: 'semesterId' },
        { path: 'moduleId' },
        { path: 'intakeCourseId' }
    ]);

    return {
        success: true,
        data: semesterModules,
        message: "Semester modules retrieved successfully"
    };
});

// Get semester modules by intake course
export const getSemesterModulesByIntakeCourse = controllerWrapper(async (req, res) => {
    const { intakeCourseId, schoolId } = req.params;
    
    const semesterModules = await SemesterModule.find({
        intakeCourseId,
        schoolId,
        isActive: true
    }).populate([
        { path: 'semesterId' },
        { path: 'moduleId' },
        { path: 'intakeCourseId' }
    ]);

    return {
        success: true,
        data: semesterModules,
        message: "Semester modules retrieved successfully"
    };
});

// Bulk add modules to semester
export const bulkAddModulesToSemester = controllerWrapper(async (req, res) => {
    const { semesterId, moduleIds, intakeCourseId, schoolId } = req.body;

    if (!Array.isArray(moduleIds) || moduleIds.length === 0) {
        return {
            success: false,
            message: "Please provide an array of module IDs"
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

    // Get the intake course to find the courseId
    const intakeCourse = await IntakeCourse.findById(intakeCourseId).populate('courseId');
    if (!intakeCourse) {
        return {
            success: false,
            message: "Intake course not found"
        };
    }

    const courseId = intakeCourse.courseId._id || intakeCourse.courseId;
    const results = [];
    const errors = [];

    for (const moduleId of moduleIds) {
        try {
            // Check if module is already assigned
            const existingAssignment = await SemesterModule.findOne({
                semesterId,
                moduleId,
                isActive: true
            });

            if (existingAssignment) {
                errors.push(`Module ${moduleId} is already assigned to this semester`);
                continue;
            }

            // Validate that module exists
            const module = await Module.findById(moduleId);
            if (!module) {
                errors.push(`Module ${moduleId} not found`);
                continue;
            }

            // Validate that module belongs to the course
            if (!module.courseId.includes(courseId)) {
                errors.push(`Module ${moduleId} does not belong to this course`);
                continue;
            }

            const semesterModuleData = {
                semesterId,
                moduleId,
                intakeCourseId,
                schoolId
            };

            const result = await SemesterModule.create(semesterModuleData);
            results.push(result);
        } catch (error) {
            errors.push(`Error adding module ${moduleId}: ${error.message}`);
        }
    }

    return {
        success: true,
        data: { 
            added: results, 
            errors,
            totalRequested: moduleIds.length,
            totalAdded: results.length,
            totalErrors: errors.length
        },
        message: `Bulk operation completed. ${results.length} modules added, ${errors.length} errors.`
    };
});

// Delete all semester modules for a school
export const deleteAllSemesterModules = controllerWrapper(async (req, res) => {
    // Find and delete all semester modules
    const result = await SemesterModule.deleteMany({});
    
    if (result.deletedCount === 0) {
        return {
            success: false,
            message: "No semester modules found"
        };
    }

    return {
        success: true,
        data: { deletedCount: result.deletedCount },
        message: `Successfully deleted ${result.deletedCount} semester modules`
    };
});
