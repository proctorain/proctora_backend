// src/utils/otp.js
//
// OTP utility functions.
// OTPs are 4-digit numbers — generated randomly, stored as bcrypt hash.
// We never store the plain OTP — same principle as passwords.

import crypto from "crypto";
import bcrypt from "bcrypt";

// Generate a random 4-digit OTP
// crypto.randomInt is cryptographically secure unlike Math.random()
export const generateOtp = () => {
  const otp = crypto.randomInt(1000, 9999).toString();
  // randomInt(1000, 9999) gives us 1000-9998
  // toString() so we can hash it as a string
  return otp;
};

// Hash OTP before storing — same as hashing passwords
// We don't want plain OTPs sitting in the database
export const hashOtp = async (otp) => {
  return bcrypt.hash(otp, 10);
  // 10 rounds is fine for OTP — it's short-lived anyway
};

// Compare incoming OTP with stored hash
export const verifyOtp = async (plainOtp, hashedOtp) => {
  return bcrypt.compare(plainOtp, hashedOtp);
};
