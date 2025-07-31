import Semester from "../../models/Academic/semester.model.js";
import IntakeCourse from "../../models/Academic/intakeCourse.model.js";
import School from "../../models/Billing/school.model.js";
import {
    createRecord,
    getAllRecords,
    getRecordById,
    updateRecord,
    deleteRecord,
    controllerWrapper,
    validateMultipleReferences,
    validateUniqueField
} from "../../utils/reusable.js";

const validateSemesterData = async (data) => {
    const { intakeCourseId, semesterNumber, semesterName, startDate, endDate, registrationStartDate, registrationEndDate, examStartDate, examEndDate, schoolId } = data;

    // Check required fields
    if (!intakeCourseId || !semesterNumber || !semesterName || !startDate || !endDate || !registrationStartDate || !registrationEndDate || !examStartDate || !examEndDate || !schoolId) {
        return {
            isValid: false,
            message: "All fields are required: intakeCourseId, semesterNumber, semesterName, startDate, endDate, registrationStartDate, registrationEndDate, examStartDate, examEndDate, schoolId"
        };
    }

    // Validate semester number is positive
    if (typeof semesterNumber !== 'number' || semesterNumber <= 0) {
        return {
            isValid: false,
            message: "Semester number must be a positive number"
        };
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const regStart = new Date(registrationStartDate);
    const regEnd = new Date(registrationEndDate);
    const examStart = new Date(examStartDate);
    const examEnd = new Date(examEndDate);

    if (end <= start) {
        return {
            isValid: false,
            message: "End date must be after start date"
        };
    }

    if (regEnd <= regStart) {
        return {
            isValid: false,
            message: "Registration end date must be after registration start date"
        };
    }

    if (regEnd > start) {
        return {
            isValid: false,
            message: "Registration end date must be before semester start date"
        };
    }

    if (examStart < start || examStart > end) {
        return {
            isValid: false,
            message: "Exam start date must be within semester dates"
        };
    }

    if (examEnd <= examStart || examEnd > end) {
        return {
            isValid: false,
            message: "Exam end date must be after exam start date and within semester dates"
        };
    }

    // Validate references exist
    const referenceValidation = await validateMultipleReferences({
        intakeCourseId: { id: intakeCourseId, Model: IntakeCourse },
        schoolId: { id: schoolId, Model: School }
    });

    if (referenceValidation) {
        return {
            isValid: false,
            message: referenceValidation.message
        };
    }

    // Check for duplicate semester number within the same intake course
    const existingSemester = await Semester.findOne({
        intakeCourseId,
        semesterNumber,
        isActive: true
    });

    if (existingSemester) {
        return {
            isValid: false,
            message: `Semester ${semesterNumber} already exists for this intake course`
        };
    }

    return { isValid: true };
};

const validateSemesterUpdateData = async (data, id) => {
    // Run basic validation first (excluding required field validation for updates)
    const { intakeCourseId, semesterNumber, startDate, endDate, registrationStartDate, registrationEndDate, examStartDate, examEndDate, schoolId } = data;

    // Validate semester number if provided
    if (semesterNumber !== undefined && (typeof semesterNumber !== 'number' || semesterNumber <= 0)) {
        return {
            isValid: false,
            message: "Semester number must be a positive number"
        };
    }

    // Validate dates if provided
    if (startDate || endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (startDate && endDate && end <= start) {
            return {
                isValid: false,
                message: "End date must be after start date"
            };
        }
    }

    if (registrationStartDate || registrationEndDate) {
        const regStart = new Date(registrationStartDate);
        const regEnd = new Date(registrationEndDate);

        if (registrationStartDate && registrationEndDate && regEnd <= regStart) {
            return {
                isValid: false,
                message: "Registration end date must be after registration start date"
            };
        }
    }

    // Validate references if provided
    const references = {};
    if (intakeCourseId) references.intakeCourseId = { id: intakeCourseId, Model: IntakeCourse };
    if (schoolId) references.schoolId = { id: schoolId, Model: School };

    if (Object.keys(references).length > 0) {
        const referenceValidation = await validateMultipleReferences(references);
        if (referenceValidation) {
            return {
                isValid: false,
                message: referenceValidation.message
            };
        }
    }

    // Check for duplicate semester number within the same intake course if updating these fields
    if (semesterNumber || intakeCourseId) {
        const currentSemester = await Semester.findById(id);
        if (!currentSemester) {
            return {
                isValid: false,
                message: "Semester not found"
            };
        }

        const finalIntakeCourseId = intakeCourseId || currentSemester.intakeCourseId;
        const finalSemesterNumber = semesterNumber || currentSemester.semesterNumber;

        const existingSemester = await Semester.findOne({
            intakeCourseId: finalIntakeCourseId,
            semesterNumber: finalSemesterNumber,
            isActive: true,
            _id: { $ne: id }
        });

        if (existingSemester) {
            return {
                isValid: false,
                message: `Semester ${finalSemesterNumber} already exists for this intake course`
            };
        }
    }

    return { isValid: true };
};

export const createSemester = controllerWrapper(async (req, res) => {
    return await createRecord(
        Semester,
        req.body,
        "semester",
        validateSemesterData
    );
});

export const getSemesters = controllerWrapper(async (req, res) => {
    return await getAllRecords(
        Semester,
        "semesters",
        [
            {
                path: 'intakeCourseId',
                populate: [
                    { path: 'intakeId' },
                    { path: 'courseId' }
                ]
            },
            { path: 'schoolId', select: 'schoolName' }
        ],
        { isActive: true }
    );
});

export const getSemestersBySchoolId = controllerWrapper(async (req, res) => {
    const { schoolId } = req.params;
    return await getAllRecords(
        Semester,
        "semesters",
        [
            {
                path: 'intakeCourseId',
                populate: [
                    { path: 'intakeId' },
                    { path: 'courseId' }
                ]
            }, 'schoolId'
        ],
        { schoolId, isActive: true }
    );
});

export const getSemestersByIntakeCourse = controllerWrapper(async (req, res) => {
    const { intakeCourseId } = req.params;
    return await getAllRecords(
        Semester,
        "semesters",
        [{ path: 'intakeCourseId', select: 'intakeId courseId maxStudents currentEnrollment status' }],
        { intakeCourseId, isActive: true }
    );
});

export const getSemesterById = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await getRecordById(
        Semester,
        id,
        "semester",
        [
            { path: 'intakeCourseId', select: 'intakeId courseId maxStudents currentEnrollment status' },
            { path: 'schoolId', select: 'schoolName' }
        ]
    );
});

export const updateSemester = controllerWrapper(async (req, res) => {
    const { id } = req.params;

    // Create a validation function that has access to the id
    const validationFn = async (data) => {
        return await validateSemesterUpdateData(data, id);
    };

    return await updateRecord(Semester, id, req.body, "semester", validationFn);
});

export const deleteSemester = controllerWrapper(async (req, res) => {
    const { id } = req.params;

    // Use updateRecord to perform soft delete
    return await updateRecord(Semester, id, { isActive: false }, "semester");
});

export const getCurrentSemester = controllerWrapper(async (req, res) => {
    const { intakeCourseId } = req.params;
    const now = new Date();

    const currentSemester = await Semester.findOne({
        intakeCourseId,
        startDate: { $lte: now },
        endDate: { $gte: now },
        isActive: true
    }).populate('intakeCourseId', 'intakeId courseId maxStudents currentEnrollment status');

    if (!currentSemester) {
        return {
            success: false,
            message: "No current semester found for this intake course",
            statusCode: 404
        };
    }

    return {
        success: true,
        message: "Current semester fetched successfully",
        data: currentSemester,
        statusCode: 200
    };
});

export const getUpcomingSemesters = controllerWrapper(async (req, res) => {
    const { schoolId } = req.params;
    const now = new Date();

    const upcomingSemesters = await Semester.find({
        schoolId,
        startDate: { $gt: now },
        isActive: true
    })
        .populate('intakeCourseId', 'intakeId courseId maxStudents currentEnrollment status')
        .sort({ startDate: 1 });

    return {
        success: true,
        message: "Upcoming semesters fetched successfully",
        data: upcomingSemesters,
        statusCode: 200
    };
});

export const updateSemesterStatus = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['upcoming', 'registration_open', 'in_progress', 'exam_period', 'completed'];
    if (!validStatuses.includes(status)) {
        return {
            success: false,
            message: "Invalid status. Must be one of: " + validStatuses.join(', '),
            statusCode: 400
        };
    }

    const semester = await Semester.findByIdAndUpdate(
        id,
        { status },
        { new: true, runValidators: true }
    ).populate('intakeCourseId', 'intakeId courseId maxStudents currentEnrollment status');

    if (!semester) {
        return {
            success: false,
            message: "Semester not found",
            statusCode: 404
        };
    }

    return {
        success: true,
        message: "Semester status updated successfully",
        data: semester,
        statusCode: 200
    };
});