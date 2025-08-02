import Semester from "../../models/Academic/semester.model.js";
import Course from "../../models/Academic/course.model.js";
import School from "../../models/Billing/school.model.js";
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

const getLastSemesterForCourse = async (courseId) => {
    const lastSemester = await Semester.findOne({
        courseId,
        isActive: true
    })
        .sort({ endDate: -1 }) // Get the semester with the latest end date
        .populate('courseId');

    return lastSemester;
};

const getMaxDuration = async (courseId) => {
    const course = await Course.findById(courseId);
    return course.duration;
};

const validateSemesterData = async (data, excludeId = null) => {
    const { courseId, semesterNumber, year, semesterName, startDate, endDate, registrationStartDate, registrationEndDate, examStartDate, examEndDate, schoolId } = data;

    // Check required fields for create operations (when excludeId is null)
    if (!excludeId) {
        if (!courseId || !semesterNumber || !year || !semesterName || !startDate || !endDate || !registrationStartDate || !registrationEndDate || !examStartDate || !examEndDate || !schoolId) {
            return {
                isValid: false,
                message: "All fields are required: courseId, semesterNumber, year, semesterName, startDate, endDate, registrationStartDate, registrationEndDate, examStartDate, examEndDate, schoolId"
            };
        }
    }

    // Validate course duration if courseId is provided
    if (courseId) {
        const maxDuration = await getMaxDuration(courseId);
        console.log("🚀 ~ validateSemesterData ~ maxDuration:", maxDuration);

        if (maxDuration) {
            // Get all existing semesters for this course to calculate total duration
            const existingSemesters = await Semester.find({
                courseId,
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

            console.log("🚀 ~ validateSemesterData ~ totalDurationMonths:", totalDurationMonths);

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
            registrationStartDate: registrationStartDate || currentSemester.registrationStartDate,
            registrationEndDate: registrationEndDate || currentSemester.registrationEndDate,
            examStartDate: examStartDate || currentSemester.examStartDate,
            examEndDate: examEndDate || currentSemester.examEndDate,
            courseId: courseId || currentSemester.courseId,
            semesterNumber: semesterNumber || currentSemester.semesterNumber,
            year: year || currentSemester.year
        };
    }

    // NEW: Validate start date against last semester (only for new semesters)
    if (!excludeId && mergedData.courseId && mergedData.startDate) {
        const lastSemester = await getLastSemesterForCourse(mergedData.courseId);

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
    if (mergedData.startDate && mergedData.endDate && mergedData.registrationStartDate && mergedData.registrationEndDate && mergedData.examStartDate && mergedData.examEndDate) {
        const start = new Date(mergedData.startDate);
        const end = new Date(mergedData.endDate);
        const regStart = new Date(mergedData.registrationStartDate);
        const regEnd = new Date(mergedData.registrationEndDate);
        const examStart = new Date(mergedData.examStartDate);
        const examEnd = new Date(mergedData.examEndDate);

        // 1. End date must be after start date
        if (end <= start) {
            return {
                isValid: false,
                message: "End date must be after start date"
            };
        }

        // 2. Registration end date must be after registration start date
        if (regEnd <= regStart) {
            return {
                isValid: false,
                message: "Registration end date must be after registration start date"
            };
        }

        // 3. Registration end date must be before semester start date
        if (regEnd > start) {
            return {
                isValid: false,
                message: "Registration end date must be before or equal to semester start date"
            };
        }

        // 4. Exam start date must be within semester dates
        if (examStart < start || examStart > end) {
            return {
                isValid: false,
                message: "Exam start date must be within semester dates"
            };
        }

        // 5. Exam end date must be after exam start date
        if (examEnd <= examStart) {
            return {
                isValid: false,
                message: "Exam end date must be after exam start date"
            };
        }

        // 6. Exam end date must be within semester dates
        if (examEnd > end) {
            return {
                isValid: false,
                message: "Exam end date must be within semester dates"
            };
        }
    }

    // Validate references if provided
    const references = {};
    if (mergedData.courseId) references.courseId = { id: mergedData.courseId, Model: Course };
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

    // Check for duplicate semester number within the same course and year
    if (mergedData.semesterNumber && mergedData.courseId && mergedData.year) {
        const query = {
            courseId: mergedData.courseId,
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
                message: `Semester ${mergedData.semesterNumber} of Year ${mergedData.year} already exists for this course`
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
            { path: 'courseId' },
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
            { path: 'courseId' },
            { path: 'schoolId' }
        ],
        { schoolId, isActive: true }
    );
});

export const getSemestersByCourse = controllerWrapper(async (req, res) => {
    const { courseId } = req.params;
    return await getAllRecords(
        Semester,
        "semesters",
        [{ path: 'courseId' }],
        { courseId, isActive: true }
    );
});

export const getSemesterById = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await getRecordById(
        Semester,
        id,
        "semester",
        [
            { path: 'courseId' },
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
    const { courseId } = req.params;
    const now = new Date();

    const currentSemester = await Semester.findOne({
        courseId,
        startDate: { $lte: now },
        endDate: { $gte: now },
        isActive: true
    }).populate('courseId');

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
        .populate('courseId')
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
    ).populate('courseId');

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