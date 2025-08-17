import e from "express";
import {
  logout,
  register,
  sendVerifyOtp,
  verifyEmail,
  loginUser,
  isAuthenticated,
  sendResetOtp,
  resetPassword,
  loginWithOAuth,
} from "../controllers/auth.controllers.js";
import { userAuth } from "../utils/authMiddleware.js";

const router = e.Router();

router.post("/register", register);

router.post("/login", loginUser);

router.post("/oauth-login", loginWithOAuth);

router.post("/logout", logout);

router.post("/send-verify-otp", userAuth, sendVerifyOtp);

router.post("/verify-account", userAuth, verifyEmail);

router.post("/is-auth", userAuth, isAuthenticated);

router.post("/send-reset-otp", sendResetOtp);
router.post("/reset-password", resetPassword);

export default router;
