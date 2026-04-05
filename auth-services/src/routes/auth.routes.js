// src/routes/auth.routes.js

import { Router } from "express";
import passport from "passport";
import rateLimit from "express-rate-limit";
import * as authController from "../controllers/auth.controller.js";
import {authMiddleware} from "../middlewares/auth.middleware.js";
import {validate} from "../middlewares/validate.middleware.js";
import {
  registerDTO,
  loginDTO,
  verifyOtpDTO,
  resendOtpDTO,
  forgotPasswordDTO,
  verifyResetOtpDTO,
  resetPasswordDTO,
  refreshTokenDTO,
} from "../dtos/auth.dto.js";
import { FRONTEND_URL } from '../config/env.js'

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { status: "error", message: "Too many requests. Try again later." },
});

// ── Public routes ─────────────────────────────────────────────────────────────
router.post(
  "/register",
  authLimiter,
  validate(registerDTO),
  authController.register,
);
router.post(
  "/verify-otp",
  authLimiter,
  validate(verifyOtpDTO),
  authController.verifyEmailOtp,
);
router.post(
  "/resend-otp",
  authLimiter,
  validate(resendOtpDTO),
  authController.resendOtp,
);
router.post("/login", authLimiter, validate(loginDTO), authController.login);
router.post(
  "/forgot-password",
  authLimiter,
  validate(forgotPasswordDTO),
  authController.forgotPassword,
);
router.post(
  "/verify-reset-otp",
  authLimiter,
  validate(verifyResetOtpDTO),
  authController.verifyResetOtp,
);
router.post(
  "/reset-password",
  authLimiter,
  validate(resetPasswordDTO),
  authController.resetPassword,
);
router.post("/refresh", validate(refreshTokenDTO), authController.refresh);

// ── Google OAuth routes ───────────────────────────────────────────────────────
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["email", "profile"],
    session: false,
  }),
  // This redirects the user to Google's login page
  // No controller needed — passport handles the redirect
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${FRONTEND_URL}/auth/callback?error=Google authentication failed`,
  }),
  authController.googleAuthCallback,
  // After Google redirects back, passport calls verify function
  // then calls googleAuthCallback with req.user populated
);

// ── Protected routes ──────────────────────────────────────────────────────────
router.post("/logout", authMiddleware, authController.logout);
router.get("/me", authMiddleware, authController.getMe);

export default router;
