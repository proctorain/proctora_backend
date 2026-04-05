// src/dtos/auth.dto.js

import { z } from "zod";

export const registerDTO = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8).max(100),
});

export const loginDTO = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1),
});

export const verifyOtpDTO = z.object({
  email: z.string().email("Invalid email"),
  otp: z
    .string()
    .length(4, "OTP must be 4 digits")
    .regex(/^\d+$/, "OTP must be numeric"),
});

export const resendOtpDTO = z.object({
  email: z.string().email("Invalid email"),
  type: z.enum(["verification", "password-reset"]).default("verification"),
});

export const forgotPasswordDTO = z.object({
  email: z.string().email("Invalid email"),
});

export const verifyResetOtpDTO = z.object({
  email: z.string().email("Invalid email"),
  otp: z.string().length(4).regex(/^\d+$/),
});

export const resetPasswordDTO = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(100),
});

export const refreshTokenDTO = z.object({
  refreshToken: z.string().min(1),
});
