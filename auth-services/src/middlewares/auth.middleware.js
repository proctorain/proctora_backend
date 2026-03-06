// src/middlewares/auth.middleware.js

// Protects routes that require a logged-in user.
// Attach it to any route like: router.get("/me", authMiddleware, getMe)
//
// Client must send: Authorization: Bearer eyJhbGci...
// We verify the token, decode the userId, attach to req.user

import { verifyAccessToken } from '../utils/jwt.js';
import HTTP_STATUS from "../utils/http.js";

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  // Check for the Authorization header

  if (!authHeader) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      status: "error",
      message: "No authorization token provided",
    });
  }

  const parts = authHeader.split(" ");
  // "Bearer eyJhbGci..." → ["Bearer", "eyJhbGci..."]

  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      status: "error",
      message: "Format must be: Authorization: Bearer <token>",
    });
  }

  const token = parts[1]; // the actual JWT string

  try {
    const decoded = verifyAccessToken(token);
    // Throws if expired or tampered.
    // Returns: { id: "uuid", iat: 1234567890, exp: 1234568790 }

    req.user = decoded;
    // Attach to req so any controller after this can use req.user.id

    next(); // token is valid, proceed to controller
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        status: "error",
        message: "Access token expired. Use /refresh to get a new one.",
      });
    }
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      status: "error",
      message: "Invalid token",
    });
  }
};

