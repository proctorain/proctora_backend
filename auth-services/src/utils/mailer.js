import axios from "axios";
import { MAIL_SERVICE_URL, MAIL_SERVICE_SECRET } from "../config/env.js";

const mailClient = axios.create({
  baseURL: MAIL_SERVICE_URL,
  headers: {
    "Content-Type": "application/json",
    // Secret header so mail-service accepts our requests
    "x-mail-secret": MAIL_SERVICE_SECRET,
  },
});

export const sendVerificationEmail = async (email, verificationLink) => {
  await mailClient.post("/send", {
    to: email,
    type: "verification",
    data: { verificationLink },
  });
};

export const sendPasswordResetEmail = async (email, resetLink) => {
  await mailClient.post("/send", {
    to: email,
    type: "password-reset",
    data: { resetLink },
  });
};
