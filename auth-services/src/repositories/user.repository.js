// src/repositories/user.repository.js

import {prisma} from "../config/prisma.js";

// ── Find ──────────────────────────────────────────────────────────────────────

export const findUserByEmail = async (email) => {
  return prisma.userss.findUnique({
    where: { email },
    include: { profile: true },
  });
};

export const findUserById = async (id) => {
  return prisma.userss.findUnique({
    where: { id },
    include: { profile: true },
  });
};

// ── Create ────────────────────────────────────────────────────────────────────

export const createEmailUser = async (email, hashedPassword) => {
  return prisma.userss.create({
    data: {
      email,
      password: hashedPassword,
      authMethod: "email",
      verified: false,
      // Profile created empty — filled during onboarding
      profile: { create: {} },
    },
    include: { profile: true },
  });
};

export const createGoogleUser = async ({ email, name, avatarUrl }) => {
  return prisma.userss.create({
    data: {
      email,
      authMethod: "google",
      verified: true, // Google already verified the email
      profile: {
        create: {
          name,
          avatarUrl,
        },
      },
    },
    include: { profile: true },
  });
};

// ── OTP ───────────────────────────────────────────────────────────────────────

export const saveOtp = async (userId, hashedOtp) => {
  return prisma.userss.update({
    where: { id: userId },
    data: {
      otp: hashedOtp,
      otpExpiry: new Date(Date.now() + 10 * 60 * 1000), // 10 min
      otpAttempts: 0, // reset attempts on new OTP
      otpLastSentAt: new Date(),
    },
  });
};

export const incrementOtpAttempts = async (userId, attempts) => {
  // If attempts hit 10, set cooldown of 20 minutes
  const isCooldown = attempts >= 10;

  return prisma.userss.update({
    where: { id: userId },
    data: {
      otpAttempts: attempts,
      otpCooldownUntil: isCooldown
        ? new Date(Date.now() + 20 * 60 * 1000)
        : null,
      // Clear OTP on cooldown so it can't be used
      ...(isCooldown && { otp: null, otpExpiry: null }),
    },
  });
};

export const clearOtp = async (userId) => {
  return prisma.userss.update({
    where: { id: userId },
    data: {
      otp: null,
      otpExpiry: null,
      otpAttempts: 0,
      otpCooldownUntil: null,
      otpLastSentAt: null,
    },
  });
};

export const markVerified = async (userId) => {
  return prisma.userss.update({
    where: { id: userId },
    data: { verified: true },
  });
};

// ── Password reset ────────────────────────────────────────────────────────────

export const saveResetToken = async (email, resetToken, expiry) => {
  return prisma.userss.update({
    where: { email },
    data: { resetToken, resetTokenExpiry: expiry },
  });
};

export const findUserByResetToken = async (resetToken) => {
  return prisma.userss.findFirst({
    where: {
      resetToken,
      resetTokenExpiry: { gt: new Date() },
    },
    include: { profile: true },
  });
};

export const updatePassword = async (userId, hashedPassword) => {
  return prisma.userss.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    },
  });
};
