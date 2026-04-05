import { config } from "dotenv";

config();

export const {
  // Server
  PORT,
  NODE_ENV,
  FRONTEND_URL,
  APP_URL,

  // Database
  DATABASE_URL,

  // Redis
  REDIS_URL,

  // JWT
  JWT_ACCESS_SECRET,
  JWT_ACCESS_EXPIRES,
  JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRES,
  JWT_VERIFY_SECRET,

  // Email
  MAIL_SERVICE_SECRET,
  MAIL_SERVICE_URL,

  //Google auth
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL,

  //Passport session
  SESSION_SECRET,
} = process.env;