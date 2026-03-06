import nodemailer from "nodemailer";
import { EMAIL_USER, EMAIL_PASS } from "../config/env.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,  // nodemailer requires 'pass', not 'password'
  },
});

// What is sent on the email
export const sendVerificationEmail = async (email, verificationLink) => {
  await transporter.sendMail({
    from: `"Auth App" <${EMAIL_USER}>`,
    to: email,
    subject: "Verify your email address",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Verify your email</h2>
        <p>Thanks for signing up to Proctora! Click below to verify your account.</p>
        <p>This link expires in <strong>24 hours</strong>.</p>
        <a href="${verificationLink}"
           style="display:inline-block; padding:12px 24px; background:#4F46E5;
                  color:white; text-decoration:none; border-radius:6px;">
          Verify Email
        </a>
        <p style="color:#999; font-size:12px; margin-top:16px;">
          If you didn't sign up, ignore this email.
        </p>
      </div>
    `,
  });
};

export const sendPasswordResetEmail = async (email, resetLink) => {
  await transporter.sendMail({
    from: `"Auth App" <${EMAIL_USER}>`,
    to: email,
    subject: "Reset your password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Reset your password</h2>
        <p>Click below to set a new password. Link expires in <strong>1 hour</strong>.</p>
        <a href="${resetLink}"
           style="display:inline-block; padding:12px 24px; background:#DC2626;
                  color:white; text-decoration:none; border-radius:6px;">
          Reset Password
        </a>
        <p style="color:#999; font-size:12px; margin-top:16px;">
          If you didn't request this, ignore this email.
        </p>
      </div>
    `,
  });
};
