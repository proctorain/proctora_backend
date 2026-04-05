import logger from "../config/logger.js";

const requestLogger = (req, res, next) => {
  const start = Date.now();

  // When response finishes
  res.on("finish", () => {
    const duration = Date.now() - start;

    logger.info(
      {
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        ip: req.ip,
        userAgent: req.get("User-Agent"),
        duration: `${duration}ms`,
      },
      "Request completed",
    );
  });

  next();
};

export default requestLogger;