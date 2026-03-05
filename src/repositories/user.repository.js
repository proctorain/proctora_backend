// src/repositories/user.repository.js

// THE RULE OF REPOSITORIES:
// This file is the ONLY place in the codebase that touches Prisma/database.
// No business logic. No hashing. No tokens. Just database CRUD.
//
// WHY?
// If you later switch databases (Prisma → raw SQL → MongoDB),
// you only change THIS file. Everything else stays the same.

import { prisma } from '../config/prisma.js';

export const findUserByEmail = async (email) => {
  return prisma.userss.findUnique({ where: { email } });
  // { email } is shorthand for { email: email }
  // Returns the user object or null if not found
};

export const findUserById = async (id) => {
  return prisma.userss.findUnique({ where: { id } });
};

export const createUser = async (email, hashedPassword) => {
  return prisma.userss.create({
    data: { email, password: hashedPassword },
    // verified defaults to false — defined in schema
  });
};

export const saveVerificationToken = async (email, token) => {
  return prisma.userss.update({
    where: { email },
    data: { verificationToken: token },
  });
};

export const verifyUserEmail = async (email) => {
  return prisma.userss.update({
    where: { email },
    data: {
      verified: true,
      verificationToken: null,
      // Clear the token so the link can't be clicked a second time
    },
  });
};

export const saveResetToken = async (email, resetToken, expiry) => {
  return prisma.userss.update({
    where: { email },
    data: {
      resetToken, // this is a SHA256 hash of the real token
      resetTokenExpiry: expiry,
    },
  });
};

export const findUserByResetToken = async (resetToken) => {
  return prisma.userss.findFirst({
    where: {
      resetToken,
      resetTokenExpiry: { gt: new Date() },
      // gt = "greater than" — expiry must be in the future
      // If the token expired, this returns null
    },
  });
};

export const updatePassword = async (userId, hashedPassword) => {
  return prisma.userss.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
      resetToken: null, // clear so token can't be used again
      resetTokenExpiry: null,
    },
  });
};