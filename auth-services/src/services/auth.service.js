// src/services/auth.service.js

// ALL BUSINESS LOGIC lives here.
// Services know nothing about HTTP — no req, no res.
// They call repositories (DB), utils (hash/jwt/mail), and Redis.
// When something goes wrong, they throw errors with a statusCode.
// Controllers catch those and convert them to HTTP responses.

import HTTP_STATUS from '../utils/http.js';
import { APP_URL } from '../config/env.js';
import crypto from 'crypto';
import { redisClient } from '../config/redis.js'
import {
  findUserByEmail,
  findUserById,
  createUser,
  saveVerificationToken,
  verifyUserEmail,
  saveResetToken,
  findUserByResetToken,
  updatePassword,
} from "../repositories/user.repository.js";
import { hashPassword, comparePassword } from '../utils/crypto.js'
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateVerificationToken,
  verifyVerificationToken,
} from "../utils/jwt.js";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "../utils/mailer.js";

// Register
const register = async (email, password) => {
  const existing = await findUserByEmail(email);
  if (existing) {
    const err = new Error("An account with this email already exists");
    err.statusCode = HTTP_STATUS.CONFLICT; // 409 Conflict — resource already exists
    throw err;
  }

  const hashedPassword = await hashPassword(password);
  // Hash BEFORE saving. The repo only ever sees the hash, never plaintext.

  const user = await createUser(email, hashedPassword);

  const verificationToken = generateVerificationToken(user.email);
  // A JWT signed with JWT_VERIFY_SECRET, expires 24h

  await saveVerificationToken(user.email, verificationToken);
  // Persist the token so we can invalidate it later (e.g. on resend)

  const verificationLink = `${APP_URL}/api/auth/verify-email?token=${verificationToken}`;

  await sendVerificationEmail(user.email, verificationLink);
  // If email fails, the error bubbles up. User can request resend later.

  return { id: user.id, email: user.email };
};

// login
const login = async (email, password) => {
  const user = await findUserByEmail(email);

  if (!user) {
    const err = new Error("Invalid email or password");
    err.statusCode = HTTP_STATUS.UNAUTHORIZED;
    throw err;
    // IMPORTANT: same message as wrong password below.
    // If we said "user not found", attackers learn which emails are registered.
  }

  const passwordMatch = await comparePassword(password, user.password);
  if (!passwordMatch) {
    const err = new Error("Invalid email or password");
    err.statusCode = HTTP_STATUS.UNAUTHORIZED;
    throw err;
  }

  if (!user.verified) {
    const err = new Error("Please verify your email before logging in");
    err.statusCode = HTTP_STATUS.FORBIDDEN; // 403 Forbidden — you exist but can't proceed yet
    throw err;
  }

  const accessToken = generateAccessToken(user.id);
  // Short-lived (15m), sent with every API request

  const refreshToken = generateRefreshToken(user.id);
  // Long-lived (7d), used ONLY to get new access tokens

  await redisClient.set(
    `refresh:${user.id}`, // key — colon is Redis naming convention
    refreshToken, // value
    { EX: 60 * 60 * 24 * 7 }, // TTL in seconds = 7 days
    // Redis auto-deletes this after 7 days even if user never logs out
  );

  return { accessToken, refreshToken };
};

// REFRESH ACCESS TOKEN
const refreshAccessToken = async (refreshToken) => {
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
    // Throws if token expired or signature is invalid
  } catch {
    const err = new Error("Invalid or expired refresh token");
    err.statusCode = HTTP_STATUS.UNAUTHORIZED;
    throw err;
  }

  const storedToken = await redisClient.get(`refresh:${decoded.id}`);
  // THIS is the key security check.
  // Even a perfectly valid JWT is rejected if it's not in Redis.
  // This makes logout work — we deleted from Redis, so this returns null.

  if (!storedToken || storedToken !== refreshToken) {
    const err = new Error("Session expired. Please log in again.");
    err.statusCode = HTTP_STATUS.UNAUTHORIZED;
    throw err;
  }

  const newAccessToken = generateAccessToken(decoded.id);
  return { accessToken: newAccessToken };
};

// logout
const logout = async (userId) => {
  await redisClient.del(`refresh:${userId}`);
  // Delete refresh token from Redis.
  // Their existing access token still works for up to 15 min
  // (acceptable tradeoff for a stateless system — use a blacklist to fix this)
};

// verify email
const verifyEmail = async (token) => {
  let decoded;
  try {
    decoded = verifyVerificationToken(token);
    // Decodes { email: "user@..." } from the JWT in the link
  } catch {
    const err = new Error("Verification link is invalid or has expired");
    err.statusCode = HTTP_STATUS.BAD_REQUEST;
    throw err;
  }

  const user = await findUserByEmail(decoded.email);
  if (!user) {
    const err = new Error("User not found");
    err.statusCode = HTTP_STATUS.NOT_FOUND;
    throw err;
  }

  if (user.verified) {
    return { alreadyVerified: true }; // Not an error, just inform the user
  }

  // Reject stale tokens — only the most recently issued link is valid.
  // e.g. if user requests a resend, the old link is invalidated.
  if (user.verificationToken !== token) {
    const err = new Error("Verification link is invalid or has expired");
    err.statusCode = HTTP_STATUS.BAD_REQUEST;
    throw err;
  }

  await verifyUserEmail(decoded.email);
  // Sets verified=true and clears verificationToken in DB

  return { alreadyVerified: false };
};

// forgot password
const forgotPassword = async (email) => {
  const user = await findUserByEmail(email);

  if (!user) return;
  // SECURITY: Don't throw an error here. Always return silently.
  // If we threw "email not found", attackers could enumerate registered emails.

  const resetToken = crypto.randomBytes(32).toString("hex");
  // 32 random bytes → 64 character hex string
  // crypto.randomBytes is cryptographically secure (not Math.random())

  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  // We store the HASH in the DB, not the raw token.
  // If DB is leaked, attacker has the hash — useless without the raw token.

  const expiry = new Date(Date.now() + 60 * 60 * 1000);
  // 1 hour from now in milliseconds

  await saveResetToken(email, hashedToken, expiry);

  const resetLink = `${APP_URL}/api/auth/reset-password?token=${resetToken}`;
  // Send the RAW token in the link (not the hash)
  // When user submits it, we hash it again and compare to what's in DB

  await sendPasswordResetEmail(email, resetLink);
};

// reset password
const resetPassword = async (token, newPassword) => {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  // Hash the incoming token to compare against what's stored in DB

  const user = await findUserByResetToken(hashedToken);
  // Repository checks: token matches AND expiry > now
  if (!user) {
    const err = new Error("Reset link is invalid or has expired");
    err.statusCode = HTTP_STATUS.UNAUTHORIZED;
    throw err;
  }

  const hashedPassword = await hashPassword(newPassword);
  await updatePassword(user.id, hashedPassword);
  // Saves new hash, clears resetToken + resetTokenExpiry

  await redisClient.del(`refresh:${user.id}`);
  // Invalidate all sessions after password change.
  // Forces re-login on all devices — this is the secure thing to do.
};

// get user
const getMe = async (userId) => {
  const user = await findUserById(userId);
  if (!user) {
    const err = new Error("User not found");
    err.statusCode = HTTP_STATUS.NOT_FOUND;
    throw err;
  }
  return {
    id: user.id,
    email: user.email,
    verified: user.verified,
    createdAt: user.createdAt,
  };
  // Return only safe fields — NEVER return user.password
};

export default {
  register,
  login,
  refreshAccessToken,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getMe,
};