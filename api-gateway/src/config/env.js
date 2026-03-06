import { config } from "dotenv";

config();

export const {
  // Server
  PORT,
  AUTH_SERVICE_URL,
  QUIZ_SERVICE_URL,
  FRONTEND_URL,
} = process.env;
