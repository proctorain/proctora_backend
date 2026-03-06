import { config } from "dotenv";

config();

export const {
  // Server
    PORT,
    DATABASE_URL,
    REDIS_URL,
    AUTH_SERVICE_URL,
    EMAIL_USER,
    EMAIL_PASS,
    APP_URL,
} = process.env;
