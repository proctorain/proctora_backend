// src/middlewares/upload.middleware.js
//
// Multer handles the multipart/form-data file upload.
// multer-storage-cloudinary streams the file directly to Cloudinary
// without saving anything to disk first.
//
// COMPRESSION STRATEGY:
// We use Cloudinary's eager transformations to compress
// the image to 10% quality (option B you chose).
// The original is never stored — only the compressed version.
//
// ACCEPTED: jpg, png, webp only
// MAX SIZE: 10MB

import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
import logger from "../config/logger.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: "proctora/avatars",
      // folder in Cloudinary where avatars are stored

      public_id: `avatar_${req.user.id}`,
      // Use userId as filename — overwrites previous avatar automatically
      // So old images are replaced, not accumulated

      overwrite: true,
      // Overwrites the existing image with same public_id
      // This is how we "delete" the old avatar — same key, new image

      quality: 10,
      // 10% quality — significant compression
      // Saves ~90% of storage vs original
      // Acceptable for small avatar use

      format: "webp",
      // Always convert to webp regardless of input format
      // webp is smaller than jpg/png at same quality

      transformation: [
        {
          width: 400,
          height: 400,
          crop: "fill",
          gravity: "face",
          // crop to square, focus on face if detected
        },
        {
          quality: 10,
          // apply quality compression
        },
      ],
    };
  },
});

// File filter — only allow jpg, png, webp
const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp"];

  if (!allowed.includes(file.mimetype)) {
    const err = new Error("Only JPG, PNG and WebP images are allowed");
    err.statusCode = 400;
    return cb(err, false);
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
});

// Middleware that handles multer errors cleanly
// Without this, multer throws raw errors that don't go through
// our error middleware
export const uploadAvatar = (req, res, next) => {
  const multerUpload = upload.single("avatar");
  // "avatar" = the field name in the form-data

  multerUpload(req, res, (err) => {
    if (!err) return next();

    logger.error({ err: err.message }, "File upload error");

    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        status: "error",
        message: "File too large. Maximum size is 10MB.",
      });
    }

    return res.status(400).json({
      status: "error",
      message: err.message || "File upload failed",
    });
  });
};
