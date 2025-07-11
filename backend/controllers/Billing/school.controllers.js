import User from "../../models/Academic/user.model.js";
import School from "../../models/Billing/school.model.js";
import {
    createRecord,
    getAllRecords,
    getRecordById,
    updateRecord,
    deleteRecord,
    validateReferenceExists,
    validateMultipleReferences,
    controllerWrapper,
    deleteAllRecords
} from "../../utils/reusable.js";

const validateSchoolData = async (data) => {
    const { userId, name, address, city, country, status } = data;

    // Check required fields
    if (!userId) {
        return {
            isValid: false,
            message: "userId is required"
        };
    }
    if (!name) {
        return {
            isValid: false,
            message: "name is required"
        };
    }
    if (!address) {
        return {
            isValid: false,
            message: "address is required"
        };
    }
    if (!city) {
        return {
            isValid: false,
            message: "city is required"
        };
    }
    if (!country) {
        return {
            isValid: false,
            message: "country is required"
        };
    }

    // Validate status enum values
    if (status && !["Active", "Inactive"].includes(status)) {
        return {
            isValid: false,
            message: "status must be either 'Active' or 'Inactive'"
        };
    }

    // Validate userID reference exists
    const referenceValidation = await validateReferenceExists(userId, User, "userId");
    if (referenceValidation) {
        return {
            isValid: false,
            message: referenceValidation.message
        };
    }

    return { isValid: true };
};

export const createSchool = controllerWrapper(async (req, res) => {
    return await createRecord(
        School,
        req.body,
        "school",
        validateSchoolData
    );
});

export const getAllSchool = controllerWrapper(async (req, res) => {
    return await getAllRecords(School, "school", ["userId"]);
});

export const getSchoolById = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await getRecordById(School, id, "school", ["userId"]);
});

export const getSchoolByUserId = controllerWrapper(async (req, res) => {
    const { userId } = req.params;
    return await getRecordById(User, userId, "user", ["schoolId"])
    //  get the user id and also respond and then use the user id to get the school
})

export const updateSchool = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await updateRecord(School, id, req.body, "school", validateSchoolData);
});

export const deleteSchool = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await deleteRecord(School, id, "school");
});

export const deleteAllSchools = controllerWrapper(async (req, res) => {
    return await deleteAllRecords(School, "schools");
})
