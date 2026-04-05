// src/middlewares/auth.middleware.js
//
// Same inter-service auth pattern as quiz-service.
// Calls auth-service /me to verify the token and get the user.
// Attaches user to req.user for controllers to use.

import axios from "axios";
import logger from "../config/logger.js";

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      status: "error",
      message: "No authorization token provided",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const response = await axios.get(
      `${process.env.AUTH_SERVICE_URL}/api/auth/me`,
      { headers: { Authorization: `Bearer ${token}` } },
    );

    req.user = response.data.data.user;
    // req.user = { id, email, verified, authMethod, profile }
    next();
  } catch (err) {
    logger.warn({ err: err.message }, "Auth verification failed");
    return res.status(401).json({
      status: "error",
      message: "Invalid or expired token",
    });
  }
};

export default authMiddleware;
