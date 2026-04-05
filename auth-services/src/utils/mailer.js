import axios from "axios";
import { MAIL_SERVICE_URL, MAIL_SERVICE_SECRET } from "../config/env.js";

const mailClient = axios.create({
  baseURL: MAIL_SERVICE_URL,
  headers: {
    "Content-Type": "application/json",
    // Auth between services (important for microservices)
    "x-mail-secret": MAIL_SERVICE_SECRET,
  },
  timeout: 5000, // optional: prevent hanging requests
});

// Optional: response interceptor for logging/debugging
mailClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Mail service error:", error.response?.data || error.message);
    return Promise.reject(error);
  },
);

export default mailClient;
