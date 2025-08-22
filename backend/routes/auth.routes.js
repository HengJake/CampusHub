import e from "express";
import {
  logout,
  register,
  sendVerifyOtp,
  verifyEmail,
  loginUser,
  isAuthenticated,
  sendResetOtp,
  verifyResetOtp,
  checkExistingOtp,
  resetPassword,
  loginWithOAuth,
  signupWithOAuth,
  validateGoogleForTermination,
} from "../controllers/auth.controllers.js";
import { userAuth } from "../utils/authMiddleware.js";
import { unifiedAuthentication, linkOAuthAccount } from "../utils/unifiedAuth.js";

const router = e.Router();

router.post("/register", register);

router.post("/register-oauth", signupWithOAuth);

router.post("/login", loginUser);

router.post("/oauth-login", loginWithOAuth);

router.post("/google-validate", validateGoogleForTermination);

router.post("/logout", logout);

router.post("/send-verify-otp", userAuth, sendVerifyOtp);

router.post("/verify-account", userAuth, verifyEmail);

router.post("/is-auth", userAuth, isAuthenticated);

router.post("/send-reset-otp", sendResetOtp);
router.post("/check-existing-otp", checkExistingOtp);
router.post("/verify-reset-otp", verifyResetOtp);
router.post("/reset-password", resetPassword);

// Unified authentication endpoint
router.post('/unified', async (req, res) => {
  try {
    const { oauthData } = req.body;
    console.log('Unified auth route - received oauthData:', oauthData);

    if (!oauthData || !oauthData.email) {
      return res.status(400).json({
        success: false,
        message: "Missing OAuth data or email"
      });
    }

    const result = await unifiedAuthentication(oauthData.email, null, oauthData);
    console.log('Unified auth route - result:', result);

    if (result.success && result.token) {
      // Set token in cookie like other auth endpoints
      res.cookie("token", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
    }

    res.json(result);
  } catch (error) {
    console.error('Unified auth route error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Link OAuth account endpoint
router.post('/link-oauth', async (req, res) => {
  try {
    const { email, password, oauthData } = req.body;
    const result = await linkOAuthAccount(email, password, oauthData);

    if (result.success && result.token) {
      // Set token in cookie like other auth endpoints
      res.cookie("token", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
