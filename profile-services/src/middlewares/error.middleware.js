// src/middlewares/error.middleware.js
import logger from "../config/logger.js";

const errorMiddleware = (err, req, res, next) => {
  logger.error(
    {
      method: req.method,
      url: req.originalUrl,
      status: err.statusCode || 500,
      message: err.message,
      stack: err.stack,
    },
    `Error: ${err.message}`,
  );

  res.status(err.statusCode || 500).json({
    status: "error",
    message:
      err.statusCode < 500 ? err.message : "An unexpected error occurred",
  });
};

export default errorMiddleware;
