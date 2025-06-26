import e from "express";
import {
  createUser,
  loginUser,
  getUserById,
  getUsers,
  checkExistedUserDetails
} from "../controllers/Academic/user.controllers.js";

const router = e.Router();

router.get("/", getUsers);

router.post("/", createUser);

router.post("/login", loginUser);

router.get("/:id", getUserById);

router.post("/check-user", checkExistedUserDetails);

export default router;
