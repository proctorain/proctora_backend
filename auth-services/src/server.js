// server.js

import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import session from "express-session";
import passport from "passport";
import { configurePassport } from "./config/passport.js"
import authRoutes from "./routes/auth.routes.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import logger from "./config/logger.js";
import "./config/redis.js";
import { FRONTEND_URL, SESSION_SECRET, NODE_ENV, PORT } from "./config/env.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());

// Session required by passport even though we use JWT
// Passport needs it internally for the OAuth flow
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: NODE_ENV === "production" },
  }),
);

// Initialize passport and configure Google strategy
configurePassport();
app.use(passport.initialize());
app.use(passport.session());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "auth-service" });
});

app.use("/api/auth", authRoutes);

app.use(errorMiddleware);

app.listen(PORT, () => {
  logger.info({ port: PORT }, "Auth service running");
});
