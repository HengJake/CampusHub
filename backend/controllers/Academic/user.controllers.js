import User from "../../models/Academic/user.model.js";
import bcrypt from "bcrypt";
import {
    createRecord,
    getAllRecords,
    getRecordById,
    updateRecord,
    deleteRecord,
    controllerWrapper,
    deleteAllRecords
} from "../../utils/reusable.js";

const validateUserData = async (data) => {
    const { name, password, phoneNumber, email, role, twoFA_enabled } = data;

    // Check required fields
    if (!name) {
        return {
            isValid: false,
            message: "name is required"
        };
    }
    if (!password) {
        return {
            isValid: false,
            message: "password is required"
        };
    }
    if (!phoneNumber) {
        return {
            isValid: false,
            message: "phoneNumber is required"
        };
    }
    if (!email) {
        return {
            isValid: false,
            message: "email is required"
        };
    }
    if (!role) {
        return {
            isValid: false,
            message: "role is required"
        };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return {
            isValid: false,
            message: "Invalid email format"
        };
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    if (!phoneRegex.test(phoneNumber)) {
        return {
            isValid: false,
            message: "Invalid phone number format"
        };
    }

    // Validate password strength
    if (password.length < 6) {
        return {
            isValid: false,
            message: "Password must be at least 6 characters long"
        };
    }

    // Validate role enum values
    const validRoles = ["student", "lecturer", "companyAdmin", "schoolAdmin"];
    if (!validRoles.includes(role)) {
        return {
            isValid: false,
            message: "role must be one of: student, lecturer, companyAdmin, schoolAdmin"
        };
    }

    return { isValid: true };
};

const validateUserUpdateData = async (data) => {
    const { name, phoneNumber, email, role, twoFA_enabled } = data;

    // Validate email format if provided
    if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return {
                isValid: false,
                message: "Invalid email format"
            };
        }
    }

    // Validate phone number format if provided
    if (phoneNumber) {
        const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
        if (!phoneRegex.test(phoneNumber)) {
            return {
                isValid: false,
                message: "Invalid phone number format"
            };
        }
    }

    // Validate role enum values if provided
    if (role) {
        const validRoles = ["student", "lecturer", "companyAdmin", "schoolAdmin"];
        if (!validRoles.includes(role)) {
            return {
                isValid: false,
                message: "role must be one of: student, lecturer, companyAdmin, schoolAdmin"
            };
        }
    }

    return { isValid: true };
};

export const createUser = controllerWrapper(async (req, res) => {
    const userData = { ...req.body };

    // Hash password before saving
    if (userData.password) {
        userData.password = await bcrypt.hash(userData.password, 10);
    }

    return await createRecord(
        User,
        userData,
        "user",
        validateUserData
    );
});

export const getAllUsers = controllerWrapper(async (req, res) => {
    return await getAllRecords(User, "user");
});

export const getUserById = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await getRecordById(User, id, "user");
});

export const updateUser = controllerWrapper(async (req, res) => {
    const { id } = req.params;

    // Hash password if it's being updated
    if (req.body.password) {
        req.body.password = await bcrypt.hash(req.body.password, 10);
    }

    return await updateRecord(User, id, req.body, "user", validateUserUpdateData);
});

export const deleteUser = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    return await deleteRecord(User, id, "user");
});

// Delete All Students
export const deleteAllUsers = controllerWrapper(async (req, res) => {
    return await deleteAllRecords(User, "users");
});

export const checkExistedUserDetails = controllerWrapper(async (req, res) => {
    try {
        const { name, email, phoneNumber } = req.body;

        if (!name && !email && !phoneNumber) {
            return {
                success: false,
                message: "Please provide username, email, or phoneNumber to check.",
                statusCode: 400
            };
        }

        const takenFields = {};

        if (name) {
            const userByUsername = await User.findOne({ name }).select("_id");
            if (userByUsername) takenFields.name = true;
        }

        if (email) {
            const userByEmail = await User.findOne({ email }).select("_id");
            if (userByEmail) takenFields.email = true;
        }

        if (phoneNumber) {
            const userByPhone = await User.findOne({ phoneNumber }).select("_id");
            if (userByPhone) takenFields.phoneNumber = true;
        }

        const anyTaken = Object.keys(takenFields).length > 0;

        return {
            success: true,
            data: {
                exist: anyTaken,
                takenFields
            },
            message: anyTaken
                ? "User details are already taken."
                : "All provided details are available.",
            statusCode: 200
        };
    } catch (error) {
        console.error("Error checking user existence:", error.message);
        return {
            success: false,
            message: "Server error - checkExistedUserDetails method",
            statusCode: 500
        };
    }
});