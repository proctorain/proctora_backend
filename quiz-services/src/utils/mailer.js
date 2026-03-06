// This is the raw transport config — just the Gmail connection.
// The actual email building (HTML, subject, recipients) lives in
// src/services/mail.service.js which imports this transporter.
// Keeping them separate means if you switch from Gmail to SendGrid
// later, you only change this file.

import nodemailer from "nodemailer";
import { EMAIL_USER, EMAIL_PASS } from '../config/env.js';

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
    // Remember: EMAIL_PASS must be a Google App Password
    // NOT your real Gmail password
    // Google Account → Security → 2FA → App Passwords
  },
});

// Verify the connection config on startup
// This pings Gmail's SMTP server to confirm credentials work
// Logs a clear error if EMAIL_USER or EMAIL_PASS are wrong
transporter.verify((err) => {
  if (err) {
    console.error("Mailer config error:", err.message);
  } else {
    console.log("Mailer ready (quiz-service)");
  }
});

export default transporter;
