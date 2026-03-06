// src/controllers/auth.controller.js

// CONTROLLERS only do 3 things:
//   1. Extract data from req (body, query, params)
//   2. Call the right service
//   3. Send back an HTTP response
//
// Zero business logic here. If service throws → next(err) → error middleware.

import authService from "../services/auth.service.js";
import HTTP_STATUS from '../utils/http.js';

export const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    // req.body was already validated by Zod middleware — guaranteed clean data

    const user = await authService.register(email, password);

    res.status(HTTP_STATUS.CREATED).json({
      // 201 = Created (not 200 — 201 specifically means a resource was created)
      status: "success",
      message:
        "Account created. Please check your email to verify your account.",
      data: { userId: user.id, email: user.email },
    });
  } catch (err) {
    next(err); // passes to error.middleware.js which formats the response
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const tokens = await authService.login(email, password);
    // tokens = { accessToken, refreshToken }

    res.status(HTTP_STATUS.OK).json({
      status: "success",
      message: "Login successful",
      data: tokens,
    });
  } catch (err) {
    next(err);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const tokens = await authService.refreshAccessToken(refreshToken);
    // tokens = { accessToken }  ← only a new access token, same refresh token

    res.status(HTTP_STATUS.OK).json({ status: "success", data: tokens });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    await authService.logout(req.user.id);
    // req.user.id was set by authMiddleware from the decoded JWT

    res
      .status(200)
      .json({ status: "success", message: "Logged out successfully" });
  } catch (err) {
    next(err);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    // token comes from the URL: /verify-email?token=abc123
    // req.query contains URL query parameters

    if (!token) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ status: "error", message: "Token missing from URL" });
    }

    const result = await authService.verifyEmail(token);

    const message = result.alreadyVerified
      ? "Email already verified. You can log in."
      : "Email verified! You can now log in.";

    res.status(HTTP_STATUS.OK).json({ status: "success", message });
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    await authService.forgotPassword(email);

    // Always same message — don't reveal if email exists in system
    res.status(HTTP_STATUS.OK).json({
      status: "success",
      message:
        "If an account with that email exists, a reset link has been sent.",
    });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.query;
    const { password } = req.body;

    if (!token) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ status: "error", message: "Token missing from URL" });
    }

    await authService.resetPassword(token, password);

    res.status(HTTP_STATUS.OK).json({
      status: "success",
      message: "Password reset. Please log in with your new password.",
    });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id);
    // req.user.id comes from authMiddleware → decoded JWT

    res.status(HTTP_STATUS.OK).json({ status: "success", data: { user } });
  } catch (err) {
    next(err);
  }
};