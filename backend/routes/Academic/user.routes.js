import e from "express";
import {
  createUser,
  getUserById,
  getUsers,
  checkExistedUserDetails,
  modifyUser,
  deleteUser,
} from "../../controllers/Academic/user.controllers.js";

const router = e.Router();

router.get("/", getUsers);

router.post("/", createUser);

router.get("/:id", getUserById);

router.post("/check-user", checkExistedUserDetails);

router.put("/:id", modifyUser);

router.delete("/:id", deleteUser);

export default router;
