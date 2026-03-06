// server.js
// API Gateway — single entry point for all services
//
// WHAT THE GATEWAY DOES:
// 1. Receives every request from the frontend
// 2. Looks at the URL path to decide which service to forward to
// 3. Forwards the request (including headers, body, cookies)
// 4. Returns the response from the service back to the frontend
//
// The frontend only ever knows about port 5500.
// It never knows auth-service is on 5501 or quiz-service on 5502.
//
// ROUTING MAP:
//   /api/auth/**  →  auth-service (5501)
//   /graphql      →  quiz-service (5502)


import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authProxy from "./routes/auth.proxy.js";
import graphqlProxy from "./routes/graphql.proxy.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import {
  FRONTEND_URL,
  PORT,
  AUTH_SERVICE_URL,
  QUIZ_SERVICE_URL,
} from "./config/env.js";

const app = express();

app.use(
  helmet({
    // contentSecurityPolicy must be disabled for Apollo Sandbox to work in browser
    // The sandbox loads scripts from Apollo's CDN
    contentSecurityPolicy: false,
  }),
);

app.use(
  cors({
    origin: FRONTEND_URL,
    // Only your frontend is allowed to call the gateway
    // In production replace with your actual domain

    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    // Authorization header must be allowed — JWT tokens live here

    credentials: true,
    // credentials: true allows cookies to pass through
    // needed because auth middleware uses cookie for Next.js middleware
  }),
);

// morgan logs every request: method, path, status code, response time
// "dev" format: GET /api/auth/login 200 45ms
app.use(morgan("dev"));

// Simple endpoint to verify the gateway itself is running.
// Docker, load balancers, and uptime monitors ping this.
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    gateway: "running",
    timestamp: new Date().toISOString(),
    services: {
      auth: process.env.AUTH_SERVICE_URL,
      graphql: process.env.QUIZ_SERVICE_URL,
    },
  });
});

// ── Routes ────────────────────────────────────────────────────────────────
// ORDER MATTERS in Express — routes are matched top to bottom.

// All auth REST calls → auth-service
// e.g. POST /api/auth/login, GET /api/auth/me, POST /api/auth/logout
app.use("/", authProxy);

// All GraphQL calls → quiz-service
// e.g. POST /graphql (mutations + queries)
// e.g. GET  /graphql (Apollo Sandbox browser UI)
app.use("/graphql", graphqlProxy);

// ── 404 — no route matched ────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: `Route ${req.method} ${req.path} not found on gateway`,
  });
});

app.use(errorMiddleware);


app.listen(PORT, () => {
  console.log(`API Gateway running on http://localhost:${PORT}`);
  console.log(`Auth service  → ${AUTH_SERVICE_URL}`);
  console.log(`Quiz service  → ${QUIZ_SERVICE_URL}`);
  console.log(`Health check  → http://localhost:${PORT}/health`);
});
