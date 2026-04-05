// src/services/profile.service.js
// All business logic lives here

import cloudinary from "../config/cloudinary.js";
import logger from "../config/logger.js";
import {
  findProfileByUserId,
  updateProfileName,
  updateProfileAvatar,
  removeProfileAvatar,
  upsertProfile,
} from "../repositories/profile.repository.js";

// ── Get profile ───────────────────────────────────────────────────────────────
export const getProfile = async (userId) => {
  const profile = await findProfileByUserId(userId);

  if (profile) return profile;

  const created = await upsertProfile(userId, {});
  logger.info({ userId }, "Profile created on first access");

  return created;
};

// ── Update name ───────────────────────────────────────────────────────────────
export const updateName = async (userId, name) => {
  const trimmed = name.trim();

  if (!trimmed || trimmed.length < 2) {
    const err = new Error("Name must be at least 2 characters");
    err.statusCode = 400;
    throw err;
  }

  if (trimmed.length > 100) {
    const err = new Error("Name must be under 100 characters");
    err.statusCode = 400;
    throw err;
  }

  const profile = await updateProfileName(userId, trimmed);
  logger.info({ userId }, "Profile name updated");
  return profile;
};

// ── Upload avatar ─────────────────────────────────────────────────────────────
export const uploadAvatar = async (userId, file) => {
  if (!file) {
    const err = new Error("No file uploaded");
    err.statusCode = 400;
    throw err;
  }

  // file.path = the Cloudinary URL returned by multer-storage-cloudinary
  // It's already uploaded at this point — multer did it before this runs
  const avatarUrl = file.path;

  const profile = await updateProfileAvatar(userId, avatarUrl);
  logger.info({ userId, avatarUrl }, "Avatar uploaded");
  return profile;
};

// ── Delete avatar ─────────────────────────────────────────────────────────────
export const deleteAvatar = async (userId) => {
  const profile = await findProfileByUserId(userId);

  if (!profile) {
    const err = new Error("Profile not found");
    err.statusCode = 404;
    throw err;
  }

  if (!profile.avatarUrl) {
    const err = new Error("No avatar to delete");
    err.statusCode = 400;
    throw err;
  }

  // Delete from Cloudinary using the public_id we set at upload time
  // public_id = "proctora/avatars/avatar_<userId>"
  const publicId = `proctora/avatars/avatar_${userId}`;

  try {
    await cloudinary.uploader.destroy(publicId);
    logger.info({ userId, publicId }, "Avatar deleted from Cloudinary");
  } catch (err) {
    // Log but don't crash — still clear the DB entry
    logger.error({ err: err.message }, "Failed to delete from Cloudinary");
  }

  const updated = await removeProfileAvatar(userId);
  logger.info({ userId }, "Avatar removed from profile");
  return updated;
};

// ── Complete onboarding (name + optional avatar together) ─────────────────────
export const completeOnboarding = async (userId, name, file) => {
  const trimmed = name?.trim();

  if (!trimmed || trimmed.length < 2) {
    const err = new Error("Name must be at least 2 characters");
    err.statusCode = 400;
    throw err;
  }

  // Build update data — avatar is optional
  const data = { name: trimmed };

  if (file) {
    // File already uploaded to Cloudinary by multer middleware
    data.avatarUrl = file.path;
    logger.info({ userId }, "Onboarding with avatar");
  } else {
    logger.info({ userId }, "Onboarding without avatar");
  }

  const profile = await upsertProfile(userId, data);
  logger.info({ userId }, "Onboarding complete");
  return profile;
};
