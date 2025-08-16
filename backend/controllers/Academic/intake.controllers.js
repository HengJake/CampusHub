import Intake from "../../models/Academic/intake.model.js";
import School from "../../models/Billing/school.model.js";
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

// Custom validation function for intake data
const validateIntakeData = async (data) => {
    const { intakeName, intakeMonth, registrationStartDate, registrationEndDate, orientationDate, academicEvents, isActive, status, schoolId } = data;

    // Check required fields
    if (!intakeName) {
        return {
            isValid: false,
            message: "intakeName is required"
        };
    }
    if (!intakeMonth) {
        return {
            isValid: false,
            message: "intakeMonth is required"
        };
    }
    if (!registrationStartDate) {
        return {
            isValid: false,
            message: "registrationStartDate is required"
        };
    }
    if (!registrationEndDate) {
        return {
            isValid: false,
            message: "registrationEndDate is required"
        };
    }
    if (!orientationDate) {
        return {
            isValid: false,
            message: "orientationDate is required"
        };
    }

    if (!schoolId) {
        return {
            isValid: false,
            message: "schoolId is required"
        };
    }

    // Validate intakeMonth enum values
    const validIntakeMonths = ['January', 'May', 'September'];
    if (!validIntakeMonths.includes(intakeMonth)) {
        return {
            isValid: false,
            message: "intakeMonth must be one of: January, May, September"
        };
    }

    // Validate status enum values if provided
    if (status) {
        const validStatuses = ['planning', 'registration_open', 'registration_closed', 'in_progress', 'completed'];
        if (!validStatuses.includes(status)) {
            return {
                isValid: false,
                message: "status must be one of: planning, registration_open, registration_closed, in_progress, completed"
            };
        }
    }

    // Validate dates
    const dates = [
        { name: 'registrationStartDate', value: registrationStartDate },
        { name: 'registrationEndDate', value: registrationEndDate },
        { name: 'orientationDate', value: orientationDate },
    ];

    for (const dateField of dates) {
        const dateObj = new Date(dateField.value);
        if (isNaN(dateObj.getTime())) {
            return {
                isValid: false,
                message: `${dateField.name} must be a valid date`
            };
        }
    }

    // Validate academicEvents if provided
    if (academicEvents && Array.isArray(academicEvents)) {
        for (const event of academicEvents) {
            if (!event.name || !event.date || !event.type) {
                return {
                    isValid: false,
                    message: "Each academic event must have name, date, and type"
                };
            }
            const validEventTypes = ['holiday', 'exam', 'break', 'registration', 'orientation'];
            if (!validEventTypes.includes(event.type)) {
                return {
                    isValid: false,
                    message: "Event type must be one of: holiday, exam, break, registration, orientation"
                };
            }
            const eventDate = new Date(event.date);
            if (isNaN(eventDate.getTime())) {
                return {
                    isValid: false,
                    message: "Event date must be a valid date"
                };
            }
        }
    }

    // Validate references exist
    const referenceValidation = await validateMultipleReferences({
        schoolId: { id: schoolId, Model: School }
    });

    if (referenceValidation) {
        return {
            isValid: false,
            message: referenceValidation.message
        };
    }

    return { isValid: true };
};

// Create Intake
export const createIntake = controllerWrapper(async (req, res) => {
    return await createRecord(
        Intake,
        req.body,
        "intake",
        validateIntakeData
    );
});

// Get All Intakes
export const getIntakes = controllerWrapper(async (req, res) => {
    return await getAllRecords(Intake, "intakes", ["schoolId"]);
});

// Get Intake by ID
export const getIntakeById = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await getRecordById(Intake, id, "intake", ["schoolId"]);
});

export const getIntakesBySchoolId = controllerWrapper(async (req, res) => {
    const { schoolId } = req.params;
    return await getAllRecords(
        Intake,
        "intakes",
        ["schoolId"],
        { schoolId }
    );
});

// Update Intake
export const updateIntake = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await updateRecord(
        Intake,
        id,
        req.body,
        "intake",
        validateIntakeData
    );
});

// Delete Intake
export const deleteIntake = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await deleteRecord(Intake, id, "intake");
});
// Delete All Intakes
export const deleteAllIntakes = controllerWrapper(async (req, res) => {
    return await deleteAllRecords(Intake, "intakes");
});