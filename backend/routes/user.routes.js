import e from "express";
import { createUser, loginUser } from "../controllers/user.controllers.js";

const router = e.Router();

router.post("/", createUser);

router.post("/login", loginUser);

export default router;
