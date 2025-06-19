import e from "express";
import { createUser, loginUser, getUserById } from "../controllers/user.controllers.js";

const router = e.Router();

router.post("/", createUser);

router.post("/login", loginUser);

router.get("/:id", getUserById);


export default router;
