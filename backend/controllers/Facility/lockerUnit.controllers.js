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
    const { schoolId } = data;

    // Check required fields
    if (!schoolId) {
        return {
            isValid: false,
            message: "schoolId is required"
        };
    }

    // Validate references exist
    const referenceValidation = await validateMultipleReferences({
        schoolId: { id: schoolId, Model: School },
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
export const getAllLockerUnit = controllerWrapper(async (req, res) => {
    return await getAllRecords(LockerUnit, "lockerUnit", ["resourceId"]);
});
export const getLockerUnitById = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await getRecordById(LockerUnit, id, "lockerUnit", ["resourceId"]);
});
export const getLockerUnitsByResourceId = controllerWrapper(async (req, res) => {
    const { resourceId } = req.params;
    return await getAllRecords(
        LockerUnit,
        "lockerUnits",
        ["resourceId"],
        { resourceId }
    );
});
export const updateLockerUnit = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await updateRecord(LockerUnit, id, req.body, "lockerUnit", validateLockerUnitData);
});
export const deleteLockerUnit = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await deleteRecord(LockerUnit, id, "lockerUnit");
});

export const deleteAllLockerUnits = async (req, res) => {
    try {
        await LockerUnit.deleteMany({});
        res.status(200).json({ message: 'All locker units deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting all locker units', error: error.message });
    }
};




