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
import Resource from "../../models/Facility/resource.model.js";
import LockerUnit from "../../models/Facility/lockerUnit.model.js";

// Custom validation function for locker unit data
const validateLockerUnitData = async (data) => {
    const { schoolId, name, resourceId } = data;

    // Check required fields
    if (!schoolId) {
        return {
            isValid: false,
            message: "schoolId is required"
        };
    }

    if (!name) {
        return {
            isValid: false,
            message: "name is required"
        };
    }

    if (!resourceId) {
        return {
            isValid: false,
            message: "resourceId is required"
        };
    }

    // Validate references exist
    const referenceValidation = await validateMultipleReferences({
        schoolId: { id: schoolId, Model: School },
        resourceId: { id: resourceId, Model: Resource },
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
    const lockerUnits = await LockerUnit.find({ schoolId: req.params.schoolId })
        .populate('resourceId', 'name'); 
    return {
        success: true,
        data: lockerUnits,
        message: "Locker units retrieved successfully",
        statusCode: 200
    };
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
export const getLockerUnitsBySchoolId = controllerWrapper(async (req, res) => {
    const { schoolId } = req.params;
    return await getAllRecords(
        LockerUnit,
        "lockerUnits",
        ["resourceId"],
        { schoolId }
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

export const deleteAllLockerUnits = controllerWrapper(async (req, res) => {
    const result = await LockerUnit.deleteMany({});
    return {
        success: true,
        data: { deletedCount: result.deletedCount },
        message: `${result.deletedCount} locker units deleted successfully`,
        statusCode: 200
    };
});




