import {
    createRecord,
    getAllRecords,
    getRecordById,
    updateRecord,
    deleteRecord,
    validateReferenceExists,
    validateMultipleReferences,
    controllerWrapper
} from "../../utils/reusable.js";

import School from "../../models/Billing/school.model.js";
import LockerUnit from "../../models/Facility/lockerUnit.model.js";

// Custom validation function for payment data
const validateLockerUnitData = async (data) => {
    const { schoolID } = data;

    // Check required fields
    if (!schoolID) {
        return {
            isValid: false,
            message: "schoolID is required"
        };
    }

    // Validate references exist
    const referenceValidation = await validateMultipleReferences({
        schoolID: { id: schoolID, Model: School },
    });

    if (referenceValidation) {
        return {
            isValid: false,
            message: referenceValidation.message
        };
    }

    return { isValid: true };
};

export const createLockerUnit = controllerWrapper(async (req, res) => {
    return await createRecord(
        LockerUnit,
        req.body,
        "lockerUnit",
        validateLockerUnitData
    )
})
export const getAllLockerUnit = controllerWrapper(async (req, res) => { })
export const getLockerUnitById = controllerWrapper(async (req, res) => { })
export const updateLockerUnit = controllerWrapper(async (req, res) => { })
export const deleteLockerUnit = controllerWrapper(async (req, res) => { });


