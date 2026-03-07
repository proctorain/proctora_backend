import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import mailRoutes from "./routes/mail.routes.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import { PORT } from "./config/env.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "mail-service",
    timestamp: new Date().toISOString(),
  });
});

app.use("/", mailRoutes);

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Mail service running on http://localhost:${PORT}`);
});
