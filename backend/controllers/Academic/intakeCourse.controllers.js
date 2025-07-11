import IntakeCourse from "../../models/Academic/intakeCourse.model.js";
import Intake from "../../models/Academic/intake.model.js";
import Course from "../../models/Academic/course.model.js";
import School from "../../models/Billing/school.model.js";
import {
    createRecord,
    getAllRecords,
    getRecordById,
    updateRecord,
    deleteRecord,
    validateMultipleReferences,
    controllerWrapper
} from "../../utils/reusable.js";

// Custom validation for intakeCourse data
const validateIntakeCourseData = async (data) => {
    const { intakeId, courseId, schoolId } = data;
    if (!intakeId || !courseId || !schoolId) {
        return { isValid: false, message: "intakeId, courseId, and schoolId are required" };
    }

    const referenceValidation = await validateMultipleReferences({
        intakeId: { id: intakeId, Model: Intake },
        courseId: { id: courseId, Model: Course },
        schoolId: { id: schoolId, Model: School }
    });

    if (referenceValidation) {
        return { isValid: false, message: referenceValidation.message };
    }

    return { isValid: true };
};

// Create IntakeCourse
export const createIntakeCourse = controllerWrapper(async (req, res) => {
    return await createRecord(IntakeCourse, req.body, "intake course", validateIntakeCourseData);
});

// Get All IntakeCourses
export const getAllIntakeCourses = controllerWrapper(async (req, res) => {
    return await getAllRecords(
        IntakeCourse,
        "intake courses",
        [
            "intakeId",
            "courseId",
            "schoolId"
        ]
    );
});

// Get IntakeCourse by ID
export const getIntakeCourseById = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await getRecordById(
        IntakeCourse,
        id,
        "intake course",
        [
            "intakeId",
            "courseId",
            "schoolId"
        ]
    );
});

// Update IntakeCourse
export const updateIntakeCourse = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await updateRecord(IntakeCourse, id, req.body, "intake course", validateIntakeCourseData);
});

// Delete IntakeCourse
export const deleteIntakeCourse = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await deleteRecord(IntakeCourse, id, "intake course");
});

// Get IntakeCourses by School ID
export const getIntakeCoursesBySchoolId = controllerWrapper(async (req, res) => {
    const { schoolId } = req.params;
    return await getAllRecords(
        IntakeCourse,
        "intake courses",
        [
            "intakeId",
            "courseId",
            "schoolId"
        ],
        { schoolId }
    );
});

// Get IntakeCourses by Intake ID
export const getIntakeCoursesByIntakeId = controllerWrapper(async (req, res) => {
    const { intakeId } = req.params;
    return await getAllRecords(
        IntakeCourse,
        "intake courses",
        [
            "intakeId",
            "courseId",
            "schoolId"
        ],
        { intakeId }
    );
});

// Get IntakeCourses by Course ID
export const getIntakeCoursesByCourseId = controllerWrapper(async (req, res) => {
    const { courseId } = req.params;
    return await getAllRecords(
        IntakeCourse,
        "intake courses",
        [
            "intakeId",
            "courseId",
            "schoolId"
        ],
        { courseId }
    );
});

// Get Available IntakeCourses (not full)
export const getAvailableIntakeCourses = controllerWrapper(async (req, res) => {
    try {
        const intakeCourses = await IntakeCourse.find({
            isActive: true,
            status: { $in: ['available'] }
        }).populate([
            "intakeId",
            "courseId",
            "schoolId"
        ]);

        return {
            success: true,
            data: intakeCourses,
            message: "Available intake courses retrieved successfully",
            statusCode: 200
        };
    } catch (error) {
        console.error("Error retrieving available intake courses:", error.message);
        return {
            success: false,
            message: "Server error - getAvailableIntakeCourses method",
            statusCode: 500
        };
    }
});

// Update enrollment count (increment/decrement)
export const updateEnrollmentCount = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    const { action } = req.body; // 'increment' or 'decrement'

    if (!['increment', 'decrement'].includes(action)) {
        return {
            success: false,
            message: "Action must be 'increment' or 'decrement'",
            statusCode: 400
        };
    }

    try {
        const updateValue = action === 'increment' ? 1 : -1;
        const intakeCourse = await IntakeCourse.findByIdAndUpdate(
            id,
            { $inc: { currentEnrollment: updateValue } },
            { new: true, runValidators: true }
        ).populate([
            "intakeId",
            "courseId",
            "schoolId"
        ]);

        if (!intakeCourse) {
            return {
                success: false,
                message: "Intake course not found",
                statusCode: 404
            };
        }

        // Update status based on enrollment
        let newStatus = intakeCourse.status;
        if (intakeCourse.currentEnrollment >= intakeCourse.maxStudents) {
            newStatus = 'full';
        } else if (intakeCourse.currentEnrollment > 0) {
            newStatus = 'available';
        }

        if (newStatus !== intakeCourse.status) {
            intakeCourse.status = newStatus;
            await intakeCourse.save();
        }

        return {
            success: true,
            data: intakeCourse,
            message: `Enrollment count ${action}ed successfully`,
            statusCode: 200
        };
    } catch (error) {
        console.error("Error updating enrollment count:", error.message);
        return {
            success: false,
            message: "Server error - updateEnrollmentCount method",
            statusCode: 500
        };
    }
}); 