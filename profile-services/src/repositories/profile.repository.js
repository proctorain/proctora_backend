// src/repositories/profile.repository.js
// Only Prisma queries — no logic

import prisma from "../config/prisma.js";

export const findProfileByUserId = async (userId) => {
  return prisma.profile.findUnique({
    where: { userId },
  });
};

export const updateProfileName = async (userId, name) => {
  return prisma.profile.update({
    where: { userId },
    data: { name },
  });
};

export const updateProfileAvatar = async (userId, avatarUrl) => {
  return prisma.profile.update({
    where: { userId },
    data: { avatarUrl },
  });
};

export const removeProfileAvatar = async (userId) => {
  return prisma.profile.update({
    where: { userId },
    data: { avatarUrl: null },
  });
};

export const upsertProfile = async (userId, data) => {
  // upsert = update if exists, create if not
  // Handles the case where profile row doesn't exist yet
  return prisma.profile.upsert({
    where: { userId },
    update: data,
    create: { userId, ...data },
  });
};
