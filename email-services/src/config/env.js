import { config } from "dotenv";

config();

export const {
    PORT,
    EMAIL_USER,
    EMAIL_PASS,
    APP_URL,
    MAIL_SERVICE_SECRET,
} = process.env;
