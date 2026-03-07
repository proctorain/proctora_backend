import nodemailer from "nodemailer";
import { EMAIL_USER, EMAIL_PASS } from "../config/env.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

transporter.verify((err) => {
  if (err) {
    console.error("Mailer config error:", err.message);
  } else {
    console.log("Mailer ready");
  }
});

export default transporter;
