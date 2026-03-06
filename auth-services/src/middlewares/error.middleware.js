// src/middlewares/error.middleware.js

// Catches ALL errors from the entire app.
// Any time you write next(err) anywhere, Express jumps straight here.
// Must have exactly 4 params (err, req, res, next) — that's how Express
// recognizes it as an error handler vs a normal middleware.
import HTTP_STATUS from "../utils/http.js";
import { NODE_ENV } from "../config/env.js";

const errorMiddleware = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path} →`, err.message);
  // Log it server-side so you can debug. In production use Winston/Pino.

  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  // Services attach: const err = new Error("msg"); err.statusCode = 409;
  // If no statusCode was set, default to 500 (unexpected crash)

  const message =
    statusCode >= HTTP_STATUS.INTERNAL_SERVER_ERROR
      ? "An unexpected error occurred. Please try again later."
      : err.message;
  // For 500 errors, hide the real message from the client (security).
  // For 4xx errors, it's safe to show — they're expected/intentional.

  res.status(statusCode).json({
    status: "error",
    message,
    ...(NODE_ENV === "development" && { stack: err.stack }),
    // Only include stack trace in development — never expose in production
  });
};

export default errorMiddleware;
