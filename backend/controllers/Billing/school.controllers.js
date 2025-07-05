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
    controllerWrapper
} from "../../utils/reusable.js";

export const createSchool = async (req, res) => {
    const schoolDetails = req.body;

    try {

        const user = await User.findById(schoolDetails.UserID);
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid UserID: user not found",
            });
        }

        const existingSchool = await School.findOne({
            Name: schoolDetails.Name,
            Address: schoolDetails.Address,
            City: schoolDetails.City,
            Country: schoolDetails.Country,
        });

        if (existingSchool) {
            return res.status(409).json({
                success: false,
                message: "A school with the same details already exists.",
            });
        }

        const newSchool = new School({
            UserID: schoolDetails.UserID,
            Name: schoolDetails.Name,
            Address: schoolDetails.Address,
            City: schoolDetails.City,
            Country: schoolDetails.Country,
            Status: schoolDetails.Status || "Active",
        });

        const savedSchool = await newSchool.save();

        res.status(201).json({
            success: true,
            message: "School created successfully",
            data: savedSchool,
        });
    } catch (error) {
        console.error("Error creating school:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create school",
            error: error.message,
        });
    }
};


// =========NEW ERA==================
const validatePaymentData = async (data) => {
    const { UserID } = data;

    // Check required fields
    if (!UserID) {
        return {
            isValid: false,
            message: "UserID is required"
        };
    }

    // Validate references exist
    const referenceValidation = await validateReferenceExists(UserID, User, "UserID");

    if (referenceValidation) {
        return {
            isValid: false,
            message: referenceValidation.message
        };
    }

    return { isValid: true };
};

export const deleteSchool = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await deleteRecord(School, id, "school");
})