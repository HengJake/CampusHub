import Intake from "../../models/Academic/intake.model.js";
import {
    createRecord,
    getAllRecords,
    getRecordById,
    updateRecord,
    deleteRecord,
    controllerWrapper
} from "../../utils/reusable.js";

// Custom validation function for intake data
const validateIntakeData = async (data) => {
    const { IntakeName, IntakeMonth, AcademicYear, Semester, RegistrationStartDate, RegistrationEndDate, OrientationDate, ClassesStartDate, ClassesEndDate, ExaminationStartDate, ExaminationEndDate, SchoolID } = data;

    // Check required fields
    if (!IntakeName || !IntakeMonth || !AcademicYear || !Semester || !RegistrationStartDate || !RegistrationEndDate || !OrientationDate || !ClassesStartDate || !ClassesEndDate || !ExaminationStartDate || !ExaminationEndDate || !SchoolID) {
        return {
            isValid: false,
            message: "Please provide all required fields (IntakeName, IntakeDescription, IntakeStartDate, IntakeEndDate)"
        };
    }

    // Validate dates
    const startDate = new Date(RegistrationStartDate);
    const endDate = new Date(RegistrationEndDate);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return {
            isValid: false,
            message: "Please provide valid dates"
        };
    }

    if (startDate >= endDate) {
        return {
            isValid: false,
            message: "Start date must be before end date"
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
    return await getAllRecords(Intake, "intakes");
});

// Get Intake by ID
export const getIntakeById = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await getRecordById(Intake, id, "intake");
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