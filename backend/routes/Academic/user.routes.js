import e from "express";
import {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    checkExistedUserDetails
} from "../../controllers/Academic/user.controllers.js";

const router = e.Router();

// Create a new user
router.post("/", createUser);

// Get all users
router.get("/", getAllUsers);

// Get user by ID
router.get("/:id", getUserById);

// Update user by ID
router.put("/:id", updateUser);

// Delete user by ID
router.delete("/:id", deleteUser);

// Check if user details exist
router.post("/check-user", checkExistedUserDetails);

export default router;