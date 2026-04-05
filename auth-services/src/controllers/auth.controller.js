// src/controllers/auth.controller.js

import * as authService from "../services/auth.service.js";
import logger from "../config/logger.js";
import { FRONTEND_URL } from "../config/env.js";

export const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.register(email, password);
    res.status(201).json({ status: "success", data: result });
  } catch (err) {
    next(err);
  }
};

export const verifyEmailOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const result = await authService.verifyEmailOtp(email, otp);
    res.status(200).json({ status: "success", data: result });
  } catch (err) {
    next(err);
  }
};

export const resendOtp = async (req, res, next) => {
  try {
    const { email, type } = req.body;
    const result = await authService.resendOtp(email, type);
    res.status(200).json({ status: "success", data: result });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.status(200).json({ status: "success", data: result });
  } catch (err) {
    // Pass requiresVerification flag to frontend
    if (err.requiresVerification) {
      return res.status(403).json({
        status: "error",
        message: err.message,
        requiresVerification: true,
      });
    }
    next(err);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    await authService.forgotPassword(email);
    // Always same message — prevent email enumeration
    res.status(200).json({
      status: "success",
      message: "If an account exists, an OTP has been sent.",
    });
  } catch (err) {
    next(err);
  }
};

export const verifyResetOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const result = await authService.verifyResetOtp(email, otp);
    res.status(200).json({ status: "success", data: result });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const result = await authService.resetPassword(token, password);
    res.status(200).json({ status: "success", data: result });
  } catch (err) {
    next(err);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refreshAccessToken(refreshToken);
    res.status(200).json({ status: "success", data: result });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    await authService.logout(req.user.id);
    res.status(200).json({ status: "success", message: "Logged out" });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id);
    res.status(200).json({ status: "success", data: { user } });
  } catch (err) {
    next(err);
  }
};

// ── Google OAuth controllers ──────────────────────────────────────────────────

export const googleAuthCallback = async (req, res) => {
  try {
    // req.user is set by passport after Google auth
    const result = await authService.handleGoogleAuth(req.user);

    // Redirect to frontend with tokens in query params
    // Frontend reads these and stores in localStorage + sets cookie
    const params = new URLSearchParams({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      isNewUser: result.isNewUser.toString(),
    });

    res.redirect(`${FRONTEND_URL}/auth/callback?${params}`);
  } catch (err) {
    logger.error({ err: err.message }, "Google OAuth callback error");

    // Redirect to frontend with error
    const params = new URLSearchParams({
      error: err.message,
    });
    res.redirect(`${FRONTEND_URL}/auth/callback?${params}`);
  }
};
