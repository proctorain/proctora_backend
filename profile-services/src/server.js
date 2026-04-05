// All testing with profile is done

import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import profileRoutes from "./routes/profile.route.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import requestLogger from "./middlewares/request.logger.js";
import logger from "./config/logger.js";

// Trigger cloudinary connection check on startup
import "./config/cloudinary.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// NOTE: do NOT add express.json() before multer routes
// multer parses multipart/form-data — express.json() would interfere
// We add json parsing only for non-file routes
app.use((req, res, next) => {
  if (req.is("multipart/form-data")) return next();
  express.json()(req, res, next);
});

app.use(requestLogger);

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "profile-service",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/profile", profileRoutes);

app.use(errorMiddleware);

const PORT = process.env.PORT || 5504;
app.listen(PORT, () => {
  logger.info({ port: PORT }, "Profile service running");
});
