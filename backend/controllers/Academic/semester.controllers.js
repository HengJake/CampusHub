import Semester from "../../models/Academic/semester.model.js";
import Course from "../../models/Academic/course.model.js";
import School from "../../models/Billing/school.model.js";
import IntakeCourse from "../../models/Academic/intakeCourse.model.js";
import {
    createRecord,
    getAllRecords,
    getRecordById,
    updateRecord,
    deleteRecord,
    deleteAllRecords,
    controllerWrapper,
    validateMultipleReferences,
    validateUniqueField
} from "../../utils/reusable.js";

const getLastSemesterForIntakeCourse = async (intakeCourseId) => {
    const lastSemester = await Semester.findOne({
        intakeCourseId,
        isActive: true
    })
        .sort({ endDate: -1 }) // Get the semester with the latest end date
        .populate({
            path: 'intakeCourseId',
            populate: { path: 'courseId' }
        });

    return lastSemester;
};

const getMaxDuration = async (courseId) => {
    const course = await Course.findById(courseId);
    return course.duration;
};

const validateSemesterData = async (data, excludeId = null) => {
    const { intakeCourseId, semesterNumber, year, semesterName, startDate, endDate, examStartDate, examEndDate, schoolId } = data;

    // Check required fields for create operations (when excludeId is null)
    if (!excludeId) {
        if (!intakeCourseId || !semesterNumber || !year || !semesterName || !startDate || !endDate || !examStartDate || !examEndDate || !schoolId) {
            return {
                isValid: false,
                message: "All fields are required: intakeCourseId, semesterNumber, year, semesterName, startDate, endDate, examStartDate, examEndDate, schoolId"
            };
        }
    }
 
    // Validate course duration if intakeCourseId is provided
    if (intakeCourseId) {
        // Get the course from the intake course to check duration
        const IntakeCourse = await import("../../models/Academic/intakeCourse.model.js");
        const intakeCourse = await IntakeCourse.default.findById(intakeCourseId);
        if (!intakeCourse) {
            return {
                isValid: false,
                message: "Invalid intakeCourseId"
            };
        }
        
        const maxDuration = await getMaxDuration(intakeCourse.courseId);

        if (maxDuration) {
            // Get all existing semesters for this intake course to calculate total duration
            const existingSemesters = await Semester.find({
                intakeCourseId,
                isActive: true
            }).sort({ startDate: 1 });

            // Calculate total duration by adding individual semester durations
            let totalDurationMonths = 0;

            // Add durations of existing semesters
            for (const semester of existingSemesters) {
                if (semester._id.toString() !== excludeId) { // Exclude current semester if updating
                    const startDate = new Date(semester.startDate);
                    const endDate = new Date(semester.endDate);
                    const durationInDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
                    const durationInMonths = Math.round(durationInDays / 30);
                    totalDurationMonths += durationInMonths;
                }
            }

            // Add duration of the new/updated semester
            if (startDate && endDate) {
                const newStartDate = new Date(startDate);
                const newEndDate = new Date(endDate);
                const newDurationInDays = Math.ceil((newEndDate - newStartDate) / (1000 * 60 * 60 * 24));
                const newDurationInMonths = Math.round(newDurationInDays / 30);
                totalDurationMonths += newDurationInMonths;
            }


            if (totalDurationMonths > maxDuration) {
                return {
                    isValid: false,
                    message: `Total semester duration exceeds course duration. Course duration is ${maxDuration} months, but total semester duration would be ${totalDurationMonths} months.`
                };
            }
        }
    }

    // Validate semester number if provided
    if (semesterNumber !== undefined && (typeof semesterNumber !== 'number' || semesterNumber <= 0)) {
        return {
            isValid: false,
            message: "Semester number must be a positive number"
        };
    }

    // Validate year if provided
    if (year !== undefined && (typeof year !== 'number' || year <= 0)) {
        return {
            isValid: false,
            message: "Year must be a positive number"
        };
    }

    // Get current semester data for updates to merge with update data
    let mergedData = data;
    if (excludeId) {
        const currentSemester = await Semester.findById(excludeId);
        if (!currentSemester) {
            return {
                isValid: false,
                message: "Semester not found"
            };
        }

        // Merge current data with update data for comprehensive validation
        mergedData = {
            startDate: startDate || currentSemester.startDate,
            endDate: endDate || currentSemester.endDate,
            examStartDate: examStartDate || currentSemester.examStartDate,
            examEndDate: examEndDate || currentSemester.examEndDate,
            intakeCourseId: intakeCourseId || currentSemester.intakeCourseId,
            semesterNumber: semesterNumber || currentSemester.semesterNumber,
            year: year || currentSemester.year
        };
    }

    // NEW: Validate start date against last semester (only for new semesters)
    if (!excludeId && mergedData.intakeCourseId && mergedData.startDate) {
        const lastSemester = await getLastSemesterForIntakeCourse(mergedData.intakeCourseId);

        if (lastSemester) {
            const newStartDate = new Date(mergedData.startDate);
            const lastEndDate = new Date(lastSemester.endDate);

            // Allow a small gap (e.g., 1 day) between semesters
            const minimumGap = 1; // days
            const minimumStartDate = new Date(lastEndDate);
            minimumStartDate.setDate(minimumStartDate.getDate() + minimumGap);

            if (newStartDate < minimumStartDate) {
                return {
                    isValid: false,
                    message: `Start date must be at least ${minimumGap} day after the last semester ends (${lastEndDate.toLocaleDateString()})`
                };
            }
        }
    }

    // Validate dates if they exist
    if (mergedData.startDate && mergedData.endDate && mergedData.examStartDate && mergedData.examEndDate) {
        const start = new Date(mergedData.startDate);
        const end = new Date(mergedData.endDate);
        const examStart = new Date(mergedData.examStartDate);
        const examEnd = new Date(mergedData.examEndDate);

        // 1. End date must be after start date
        if (end <= start) {
            return {
                isValid: false,
                message: "End date must be after start date"
            };
        }

        // 2. Exam start date must be within semester dates
        if (examStart < start || examStart > end) {
            return {
                isValid: false,
                message: "Exam start date must be within semester dates"
            };
        }

        // 3. Exam end date must be after exam start date
        if (examEnd <= examStart) {
            return {
                isValid: false,
                message: "Exam end date must be after exam start date"
            };
        }

        // 4. Exam end date must be within semester dates
        if (examEnd > end) {
            return {
                isValid: false,
                message: "Exam end date must be within semester dates"
            };
        }
    }

    // Validate references if provided
    const references = {};
            if (mergedData.intakeCourseId) references.intakeCourseId = { id: mergedData.intakeCourseId, Model: IntakeCourse };
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

    // Check for duplicate semester number within the same intake course and year
    if (mergedData.semesterNumber && mergedData.intakeCourseId && mergedData.year) {
        const query = {
            intakeCourseId: mergedData.intakeCourseId,
            semesterNumber: mergedData.semesterNumber,
            year: mergedData.year,
            isActive: true
        };

        // Exclude current record when updating
        if (excludeId) {
            query._id = { $ne: excludeId };
        }

        const existingSemester = await Semester.findOne(query);

        if (existingSemester) {
            return {
                isValid: false,
                message: `Semester ${mergedData.semesterNumber} of Year ${mergedData.year} already exists for this intake course`
            };
        }
    }

    return { isValid: true };
};



export const createSemester = controllerWrapper(async (req, res) => {
    const data = req.body;
    const { intakeCourseId, semesterNumber, year, semesterName, startDate, endDate, examStartDate, examEndDate, schoolId } = data;

    // Validate required fields and identify which ones are missing
    const requiredFields = [
        { field: 'intakeCourseId', value: intakeCourseId, label: 'Intake Course ID' },
        { field: 'semesterNumber', value: semesterNumber, label: 'Semester Number' },
        { field: 'year', value: year, label: 'Year' },
        { field: 'semesterName', value: semesterName, label: 'Semester Name' },
        { field: 'startDate', value: startDate, label: 'Start Date' },
        { field: 'endDate', value: endDate, label: 'End Date' },
        { field: 'examStartDate', value: examStartDate, label: 'Exam Start Date' },
        { field: 'examEndDate', value: examEndDate, label: 'Exam End Date' },
        { field: 'schoolId', value: schoolId, label: 'School ID' }
    ];

    const missingFields = requiredFields.filter(field => !field.value);
    
    if (missingFields.length > 0) {
        const missingFieldLabels = missingFields.map(field => field.label).join(', ');
        return {
            success: false,
            message: `Missing required fields: ${missingFieldLabels}`,
            statusCode: 400,
            missingFields: missingFields.map(field => field.field)
        };
    }

    // Validate semester data before creation
    const validation = await validateSemesterData(data);
    if (!validation.isValid) {
        return {
            success: false,
            message: validation.message,
            statusCode: 400
        };
    }

    return await createRecord(Semester, data, "semester");
});

export const getSemesters = controllerWrapper(async (req, res) => {
    return await getAllRecords(
        Semester,
        "semesters",
        [
            { 
                path: 'intakeCourseId',
                populate: { path: 'courseId' }
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
                populate: { path: 'courseId' }
            },
            { path: 'schoolId' }
        ],
        { schoolId, isActive: true }
    );
});

export const getSemestersByIntakeCourse = controllerWrapper(async (req, res) => {
    const { intakeCourseId } = req.params;
    return await getAllRecords(
        Semester,
        "semesters",
        [{ 
            path: 'intakeCourseId',
            populate: { path: 'courseId' }
        }],
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
            { 
                path: 'intakeCourseId',
                populate: { path: 'courseId' }
            },
            { path: 'schoolId', select: 'schoolName' }
        ]
    );
});

export const updateSemester = controllerWrapper(async (req, res) => {
    const { id } = req.params;

    // Create a validation function that has access to the id
    const validationFn = async (data) => {
        return await validateSemesterData(data, id);
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
    }).populate({
        path: 'intakeCourseId',
        populate: { path: 'courseId' }
    });

    if (!currentSemester) {
        return {
            success: false,
            message: "No current semester found for this course",
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
        .populate({
            path: 'intakeCourseId',
            populate: { path: 'courseId' }
        })
        .sort({ startDate: 1 });

    return {
        success: true,
        message: "Upcoming semesters fetched successfully",
        data: upcomingSemesters,
        statusCode: 200
    };
});

export const getSemestersByCourse = controllerWrapper(async (req, res) => {
    const { courseId } = req.params;
    
    // First get all intake courses for this course
    const IntakeCourse = await import("../../models/Academic/intakeCourse.model.js");
    const intakeCourses = await IntakeCourse.default.find({ 
        courseId, 
        isActive: true 
    }).select('_id');
    
    if (!intakeCourses.length) {
        return {
            success: true,
            message: "No intake courses found for this course",
            data: [],
            statusCode: 200
        };
    }
    
    const intakeCourseIds = intakeCourses.map(ic => ic._id);
    
    // Then get all semesters for these intake courses
    const semesters = await Semester.find({
        intakeCourseId: { $in: intakeCourseIds },
        isActive: true
    }).populate({
        path: 'intakeCourseId',
        populate: { path: 'courseId' }
    });
    
    return {
        success: true,
        message: "Semesters fetched successfully",
        data: semesters,
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
    ).populate({
        path: 'intakeCourseId',
        populate: { path: 'courseId' }
    });

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

// Delete All Semesters
export const deleteAllSemesters = controllerWrapper(async (req, res) => {
    return await deleteAllRecords(Semester, "semesters");
});