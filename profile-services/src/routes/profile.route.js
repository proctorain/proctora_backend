// src/routes/profile.routes.js
//
// Each field is a separate endpoint as requested.
// This means anything can be updated independently later.
//
// ENDPOINTS:
//   GET    /api/profile/me          → get own profile
//   POST   /api/profile/onboarding  → complete onboarding (name + optional avatar)
//   PATCH  /api/profile/name        → update name only
//   PATCH  /api/profile/avatar      → update avatar only
//   DELETE /api/profile/avatar      → remove avatar

import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { uploadAvatar } from "../middlewares/upload.middleware.js";
import * as profileController from "../controllers/profile.controller.js";

const router = Router();

// All profile routes require authentication
// Auth middleware runs first on every route
router.use(authMiddleware);

// ── Get profile ───────────────────────────────────────────────────────────────
router.get("/me", profileController.getMyProfile);

// ── Onboarding — name required, avatar optional ───────────────────────────────
// uploadAvatar runs multer — if no file sent, req.file = undefined (that's fine)
router.post("/onboarding", uploadAvatar, profileController.onboarding);

// ── Individual field updates ──────────────────────────────────────────────────
router.patch("/name", profileController.updateName);
router.patch("/avatar", uploadAvatar, profileController.updateAvatar);
router.delete("/avatar", profileController.deleteAvatar);

export default router;
