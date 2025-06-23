import e from "express";
import {
  createUser,
  loginUser,
  getUserById,
  getUsers,
} from "../controllers/user.controllers.js";

const router = e.Router();

router.get("/", getUsers);

router.post("/", createUser);

router.post("/login", loginUser);

router.get("/:id", getUserById);

export default router;
