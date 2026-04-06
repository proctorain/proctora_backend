// server.js

import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { exec } from "child_process";
import { promisify } from "util";
import compilerRoutes from "./routes/compiler.routes.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import requestLogger from "./middlewares/request.logger.js";
import logger from "./config/logger.js";

const execAsync = promisify(exec);

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: "*",
    // Public endpoint — allow all origins
    // When you add auth later, restrict this to FRONTEND_URL
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json({ limit: "200kb" }));
// 200KB limit on request body — enough for code, not enough for abuse
app.use(requestLogger);

// ── Startup check — verify Docker is available ────────────────────────────────
const checkDocker = async () => {
  try {
    await execAsync("docker info");
    logger.info("Docker is running");

    // Pre-pull Java image if not already present
    // This prevents first-request delay
    await execAsync(
      `docker pull ${process.env.DOCKER_IMAGE_JAVA || "openjdk:17-slim"}`,
    );
    logger.info("Java Docker image ready");
  } catch (err) {
    logger.error(
      { err: err.message },
      "Docker is not running or not installed",
    );
    logger.error(
      "compiler-service requires Docker. Please start Docker and restart this service.",
    );
    process.exit(1);
    // Hard exit — service is useless without Docker
  }
};

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "compiler-service",
    timestamp: new Date().toISOString(),
    supported: ["java", "python"],
  });
});

app.use("/api/compiler", compilerRoutes);
// Convenience aliases for local/Postman testing.
// This also supports gateway setups that forward `/api/compiler/*` as `/*`.
app.use("/", compilerRoutes);

app.use(errorMiddleware);

const PORT = process.env.PORT || 5505;

// Check Docker first, then start server
checkDocker().then(() => {
  app.listen(PORT, () => {
    logger.info({ port: PORT }, "Compiler service running");
  });
});
