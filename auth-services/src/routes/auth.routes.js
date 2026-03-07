// src/routes/auth.routes.js

// Routes wire the whole chain together.
// Read each route like a sentence:
//   "POST /register → validate with registerDTO → then run register controller"
//
// PUBLIC routes: anyone can call them
// PROTECTED routes: need a valid access token (authMiddleware runs first)

import express from "express";
import rateLimit from "express-rate-limit";
import { NODE_ENV } from "../config/env.js";

import {
  register,
  login,
  refresh,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getMe,
} from "../controllers/auth.controller.js";

import {authMiddleware} from "../middlewares/auth.middleware.js";
import {validate} from"../middlewares/validate.middleware.js";

import {
  registerDTO,
  loginDTO,
  refreshTokenDTO,
  forgotPasswordDTO,
  resetPasswordDTO,
} from "../dtos/auth.dto.js";

const router = express.Router();

// Rate limiter: max 10 requests per 15 minutes per IP on auth routes
// Prevents someone writing a script to brute-force passwords
// DISABLED in development for easier testing
const authLimiter = NODE_ENV === 'development' 
  ? (req, res, next) => next() // Skip rate limiting in dev
  : rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 10,
      message: {
        status: "error",
        message: "Too many attempts. Try again in 15 minutes.",
      },
      standardHeaders: true,
      legacyHeaders: false,
    });

// public routes

router.post(
  "/register",
  authLimiter, // 1st: rate limit check
  validate(registerDTO), // 2nd: Zod validates body
  register, // 3rd: controller runs (only if above passed)
);

router.post("/login", authLimiter, validate(loginDTO), login);

router.post("/refresh", validate(refreshTokenDTO), refresh);

router.get(
  "/verify-email",
  verifyEmail,
);

router.post(
  "/forgot-password",
  authLimiter,
  validate(forgotPasswordDTO),
  forgotPassword,
);

router.post("/reset-password", validate(resetPasswordDTO), resetPassword);

// protected routes

router.post(
  "/logout",
  authMiddleware, // verifies JWT, sets req.user — if invalid, stops here with 401
  logout,
);

router.get("/me", authMiddleware, getMe);

export default router;