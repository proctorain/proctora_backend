import transporter from "../config/mailer.js";
import { verificationTemplate } from "../templates/verification.js";
import { passwordResetTemplate } from "../templates/passwordReset.js";
import { teacherResultTemplate } from "../templates/teacherResult.js";
import { studentResultTemplate } from "../templates/studentResult.js";
import { EMAIL_USER } from "../config/env.js";
import { otpVerificationTemplate } from "../templates/otpVerification.js";
import { otpPasswordResetTemplate } from "../templates/otpPasswordReset.js";

const TEMPLATES = {
  verification: verificationTemplate, // old — keep for now
  "password-reset": passwordResetTemplate, // old — keep for now
  "otp-verification": otpVerificationTemplate, // new
  "otp-password-reset": otpPasswordResetTemplate, // new
  "teacher-result": teacherResultTemplate,
  "student-result": studentResultTemplate,
};

export const sendMail = async ({ to, type, data }) => {
  // Look up the template function by type
  const templateFn = TEMPLATES[type];

  if (!templateFn) {
    const err = new Error(`Unknown email type: "${type}"`);
    err.statusCode = 400;
    throw err;
  }

  // Call the template function with the data to get subject + html
  const { subject, html } = templateFn(data);

  await transporter.sendMail({
    from: `"Proctora" <${EMAIL_USER}>`,
    to,
    subject,
    html,
  });

  console.log(`[Mail] Sent "${type}" to ${to}`);
};
