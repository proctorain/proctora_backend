import { config } from "dotenv";

config();

export const {
  // Server
    PORT,
    DATABASE_URL,
    REDIS_URL,
    AUTH_SERVICE_URL,
    MAIL_SERVICE_SECRET, 
    MAIL_SERVICE_URL,
    APP_URL,
} = process.env;
