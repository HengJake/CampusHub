import e from "express";
import {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    checkExistedUserDetails,
    deleteAllUsers
} from "../../controllers/Academic/user.controllers.js";
import { userAuth } from "../../utils/authMiddleware.js";

const router = e.Router();

// Create a new user
router.post("/", createUser);

// Get all users (protected)
router.get("/", userAuth, getAllUsers);

// Get user by ID (protected)
router.get("/:id", userAuth, getUserById);

// Delete all users (protected)
router.delete("/all", userAuth, deleteAllUsers);

// Update user by ID (protected)
router.put("/:id", userAuth, updateUser);

// Delete user by ID (protected)
router.delete("/:id", userAuth, deleteUser);

// Check if user details exist
router.post("/check-user", checkExistedUserDetails);

export default router;