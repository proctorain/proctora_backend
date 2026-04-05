// src/config/cloudinary.js
//
// Cloudinary is the cloud storage for images.
// We configure it once here and export the instance.
// multer-storage-cloudinary uses this to upload directly
// from multer's memory into Cloudinary — no temp files on disk.

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Verify connection on startup
cloudinary.api
  .ping()
  .then(() => console.log("Cloudinary connected"))
  .catch((err) => console.error("Cloudinary error:", err.message));

export default cloudinary;
