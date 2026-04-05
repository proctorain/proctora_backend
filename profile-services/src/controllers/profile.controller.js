// src/controllers/profile.controller.js
// Only HTTP — reads req, calls service, sends res

import * as profileService from "../services/profile.service.js";

// GET /api/profile/me
export const getMyProfile = async (req, res, next) => {
  try {
    const profile = await profileService.getProfile(req.user.id);
    res.status(200).json({ status: "success", data: { profile } });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/profile/name
export const updateName = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        status: "error",
        message: "Name is required",
      });
    }

    const profile = await profileService.updateName(req.user.id, name);
    res.status(200).json({
      status: "success",
      message: "Name updated",
      data: { profile },
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/profile/avatar
// uploadAvatar middleware runs before this — file is already on Cloudinary
export const updateAvatar = async (req, res, next) => {
  try {
    const profile = await profileService.uploadAvatar(req.user.id, req.file);
    res.status(200).json({
      status: "success",
      message: "Avatar updated",
      data: { profile },
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/profile/avatar
export const deleteAvatar = async (req, res, next) => {
  try {
    const profile = await profileService.deleteAvatar(req.user.id);
    res.status(200).json({
      status: "success",
      message: "Avatar removed",
      data: { profile },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/profile/onboarding
// name required, avatar optional
export const onboarding = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        status: "error",
        message: "Name is required",
      });
    }

    const profile = await profileService.completeOnboarding(
      req.user.id,
      name,
      req.file, // undefined if no file uploaded — service handles this
    );

    res.status(200).json({
      status: "success",
      message: "Onboarding complete",
      data: { profile },
    });
  } catch (err) {
    next(err);
  }
};
