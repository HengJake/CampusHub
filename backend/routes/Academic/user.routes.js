// Programmer Name : Heng Jun Kai, Project Manager, Leader Full Stack developer
// Program Name: user.routes.js
// Description: User management route definitions for CRUD operations, profile management, and user data endpoints
// First Written on: July 15, 2024
// Edited on: Friday, July 19, 2024

import e from "express";
import {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    checkExistedUserDetails,
    deleteAllUsers,
    getUsersBySchoolId,
    createOrUpdateOAuthUser
} from "../../controllers/Academic/user.controllers.js";
import { userAuth } from "../../utils/authMiddleware.js";

const router = e.Router();

// Create a new user
router.post("/", createUser);

// Create or update OAuth user (Google, Facebook, etc.)
router.post("/oauth", createOrUpdateOAuthUser);

// Get all users (protected)
router.get("/", getAllUsers);

// Get user by ID (protected)
router.get("/:id", getUserById);

// Delete all users (protected)
router.delete("/all", deleteAllUsers);

// Update user by ID (protected)
router.put("/:id", updateUser);

// Delete user by ID (protected)
router.delete("/:id", deleteUser);

// Check if user details exist
router.post("/check-user", checkExistedUserDetails);

// Get users by school ID
router.get("/school/:schoolId", getUsersBySchoolId);

export default router;