// src/services/auth.service.js

import crypto from "crypto";
import {redisClient} from "../config/redis.js";
import logger from "../config/logger.js";
import {
  findUserByEmail,
  findUserById,
  createEmailUser,
  createGoogleUser,
  saveOtp,
  incrementOtpAttempts,
  clearOtp,
  markVerified,
  saveResetToken,
  findUserByResetToken,
  updatePassword,
} from "../repositories/user.repository.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
import { generateOtp, hashOtp, verifyOtp } from "../utils/otp.js";
import mailClient from "../utils/mailer.js";

// ── Helper — issue tokens ─────────────────────────────────────────────────────
const issueTokens = async (userId) => {
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);

  await redisClient.set(`refresh:${userId}`, refreshToken, {
    EX: 60 * 60 * 24 * 7,
  });

  return { accessToken, refreshToken };
};

// ── Helper — send OTP email ───────────────────────────────────────────────────
const sendOtpEmail = async (email, otp, type = "verification") => {
  await mailClient.post("/send", {
    to: email,
    type: type === "verification" ? "otp-verification" : "otp-password-reset",
    data: { otp, email },
  });
};

// ── REGISTER ──────────────────────────────────────────────────────────────────
export const register = async (email, password) => {
  const existing = await findUserByEmail(email);

  if (existing) {
    // Tell frontend WHICH method was used so it can show right error
    const err = new Error(
      existing.authMethod === "google"
        ? "This email is registered with Google. Please use Google login."
        : "An account with this email already exists.",
    );
    err.statusCode = 409;
    throw err;
  }

  const hashedPassword = await hashPassword(password);
  const user = await createEmailUser(email, hashedPassword);

  // Generate and send OTP
  const otp = generateOtp(); // plain 4-digit OTP
  const hashedOtp = await hashOtp(otp);
  await saveOtp(user.id, hashedOtp);
  await sendOtpEmail(email, otp, "verification");

  logger.info({ userId: user.id, email }, "User registered, OTP sent");

  return {
    userId: user.id,
    email: user.email,
    message: "OTP sent to your email",
  };
};

// ── VERIFY OTP (email verification after register) ────────────────────────────
export const verifyEmailOtp = async (email, otp) => {
  const user = await findUserByEmail(email);

  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }

  if (user.verified) {
    const err = new Error("Email already verified");
    err.statusCode = 400;
    throw err;
  }

  await validateOtp(user, otp);
  // validateOtp throws if invalid — if we get here it passed

  // Mark verified + clear OTP
  await markVerified(user.id);
  await clearOtp(user.id);

  // Auto login — issue tokens immediately
  const tokens = await issueTokens(user.id);

  logger.info({ userId: user.id }, "Email verified, user auto-logged in");

  return {
    ...tokens,
    isNewUser: true, // always new on register verify → go to onboarding
    user: { id: user.id, email: user.email },
  };
};

// ── LOGIN ─────────────────────────────────────────────────────────────────────
export const login = async (email, password) => {
  const user = await findUserByEmail(email);

  if (!user) {
    const err = new Error("Invalid email or password");
    err.statusCode = 401;
    throw err;
  }

  if (user.authMethod === "google") {
    const err = new Error(
      "This account uses Google login. Please sign in with Google.",
    );
    err.statusCode = 401;
    throw err;
  }

  const passwordMatch = await comparePassword(password, user.password);
  if (!passwordMatch) {
    const err = new Error("Invalid email or password");
    err.statusCode = 401;
    throw err;
  }

  if (!user.verified) {
    // Resend OTP and tell frontend to show OTP screen
    await resendOtp(email, "verification");
    const err = new Error("Email not verified. A new OTP has been sent.");
    err.statusCode = 403;
    err.requiresVerification = true; // frontend checks this
    throw err;
  }

  const tokens = await issueTokens(user.id);
  logger.info({ userId: user.id }, "User logged in");

  return {
    ...tokens,
    isNewUser: false, // existing user → dashboard
    user: { id: user.id, email: user.email },
  };
};

// ── RESEND OTP ────────────────────────────────────────────────────────────────
export const resendOtp = async (email, type = "verification") => {
  const user = await findUserByEmail(email);

  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }

  // Check 35 second resend cooldown
  if (user.otpLastSentAt) {
    const secondsSinceLast =
      (Date.now() - new Date(user.otpLastSentAt).getTime()) / 1000;
    if (secondsSinceLast < 35) {
      const waitSeconds = Math.ceil(35 - secondsSinceLast);
      const err = new Error(
        `Please wait ${waitSeconds} seconds before requesting a new OTP`,
      );
      err.statusCode = 429;
      err.waitSeconds = waitSeconds; // frontend uses this for countdown
      throw err;
    }
  }

  const otp = generateOtp();
  const hashedOtp = await hashOtp(otp);
  await saveOtp(user.id, hashedOtp);
  // saveOtp resets attempts to 0 — new OTP = fresh start
  await sendOtpEmail(email, otp, type);

  logger.info({ userId: user.id, type }, "OTP resent");

  return { message: "New OTP sent", otpLastSentAt: new Date() };
};

// ── VALIDATE OTP (internal helper) ───────────────────────────────────────────
const validateOtp = async (user, otp) => {
  const now = new Date();

  // Check cooldown
  if (user.otpCooldownUntil && now < user.otpCooldownUntil) {
    const minutesLeft = Math.ceil((user.otpCooldownUntil - now) / 60000);
    const err = new Error(
      `Too many attempts. Try again in ${minutesLeft} minutes.`,
    );
    err.statusCode = 429;
    err.cooldownMinutes = minutesLeft;
    throw err;
  }

  // Check OTP exists
  if (!user.otp || !user.otpExpiry) {
    const err = new Error("No OTP found. Please request a new one.");
    err.statusCode = 400;
    throw err;
  }

  // Check expiry
  if (now > user.otpExpiry) {
    const err = new Error("OTP has expired. Please request a new one.");
    err.statusCode = 400;
    throw err;
  }

  // Check attempts
  const newAttempts = user.otpAttempts + 1;
  const isValid = await verifyOtp(otp, user.otp);

  if (!isValid) {
    await incrementOtpAttempts(user.id, newAttempts);
    const remaining = 10 - newAttempts;

    if (remaining <= 0) {
      const err = new Error("Too many wrong attempts. Please wait 20 minutes.");
      err.statusCode = 429;
      throw err;
    }

    const err = new Error(
      `Invalid OTP. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`,
    );
    err.statusCode = 400;
    err.attemptsRemaining = remaining;
    throw err;
  }

  // OTP is valid — do not clear here, caller decides when to clear
};

// ── FORGOT PASSWORD ───────────────────────────────────────────────────────────
export const forgotPassword = async (email) => {
  const user = await findUserByEmail(email);

  // Silent return if user not found — prevents email enumeration
  if (!user) return;

  if (user.authMethod === "google") {
    // Don't reveal this silently — just return
    return;
  }

  // Check 35s resend timer
  if (user.otpLastSentAt) {
    const secondsSinceLast =
      (Date.now() - new Date(user.otpLastSentAt).getTime()) / 1000;
    if (secondsSinceLast < 35) {
      const waitSeconds = Math.ceil(35 - secondsSinceLast);
      const err = new Error(`Please wait ${waitSeconds} seconds`);
      err.statusCode = 429;
      err.waitSeconds = waitSeconds;
      throw err;
    }
  }

  const otp = generateOtp();
  const hashedOtp = await hashOtp(otp);
  await saveOtp(user.id, hashedOtp);
  await sendOtpEmail(email, otp, "password-reset");

  logger.info({ userId: user.id }, "Password reset OTP sent");
};

// ── VERIFY RESET OTP ──────────────────────────────────────────────────────────
export const verifyResetOtp = async (email, otp) => {
  const user = await findUserByEmail(email);

  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }

  await validateOtp(user, otp);

  // Issue a short-lived reset token so frontend can call resetPassword
  // without needing to send the OTP again
  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 min

  await saveResetToken(email, hashedToken, expiry);
  await clearOtp(user.id);

  logger.info({ userId: user.id }, "Reset OTP verified");

  return { resetToken }; // frontend sends this in resetPassword call
};

// ── RESET PASSWORD ────────────────────────────────────────────────────────────
export const resetPassword = async (token, newPassword) => {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await findUserByResetToken(hashedToken);

  if (!user) {
    const err = new Error("Reset token is invalid or has expired");
    err.statusCode = 400;
    throw err;
  }

  const hashedPassword = await hashPassword(newPassword);
  await updatePassword(user.id, hashedPassword);
  await redisClient.del(`refresh:${user.id}`); // logout all devices

  // Auto login after reset
  const tokens = await issueTokens(user.id);
  logger.info({ userId: user.id }, "Password reset successful");

  return {
    ...tokens,
    isNewUser: false,
    user: { id: user.id, email: user.email },
  };
};

// ── GOOGLE OAUTH ──────────────────────────────────────────────────────────────
export const handleGoogleAuth = async ({ email, name, avatarUrl }) => {
  const existing = await findUserByEmail(email);

  if (existing) {
    if (existing.authMethod === "email") {
      // Email/password account exists — block Google login
      const err = new Error(
        "This email is registered with email and password. Please log in with your password.",
      );
      err.statusCode = 409;
      throw err;
    }

    // Existing Google user — login
    const tokens = await issueTokens(existing.id);
    logger.info({ userId: existing.id }, "Google user logged in");

    return {
      ...tokens,
      isNewUser: false, // existing → dashboard
      user: { id: existing.id, email: existing.email },
    };
  }

  // New Google user — create account
  const user = await createGoogleUser({ email, name, avatarUrl });
  const tokens = await issueTokens(user.id);
  logger.info({ userId: user.id, email }, "New Google user registered");

  return {
    ...tokens,
    isNewUser: true, // new → onboarding
    user: { id: user.id, email: user.email },
  };
};

// ── REFRESH ───────────────────────────────────────────────────────────────────
export const refreshAccessToken = async (refreshToken) => {
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    const err = new Error("Invalid or expired refresh token");
    err.statusCode = 401;
    throw err;
  }

  const storedToken = await redisClient.get(`refresh:${decoded.id}`);
  if (!storedToken || storedToken !== refreshToken) {
    const err = new Error("Session expired. Please log in again.");
    err.statusCode = 401;
    throw err;
  }

  return { accessToken: generateAccessToken(decoded.id) };
};

// ── LOGOUT ────────────────────────────────────────────────────────────────────
export const logout = async (userId) => {
  await redisClient.del(`refresh:${userId}`);
  logger.info({ userId }, "User logged out");
};

// ── GET ME ────────────────────────────────────────────────────────────────────
export const getMe = async (userId) => {
  const user = await findUserById(userId);
  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }

  return {
    id: user.id,
    email: user.email,
    verified: user.verified,
    authMethod: user.authMethod,
    profile: user.profile,
    createdAt: user.createdAt,
  };
};
